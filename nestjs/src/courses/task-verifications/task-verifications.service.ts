import { CourseTask } from '@entities/courseTask';
import { Student } from '@entities/index';
import { TaskType } from '@entities/task';
import { TaskVerification } from '@entities/taskVerification';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isBefore, isValid, subHours } from 'date-fns';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';
import { MoreThan, Repository } from 'typeorm';
import { SelfEducationAnswers, SelfEducationQuestionSelectedAnswersDto, TaskVerificationAttemptDto } from './dto';
import { CourseTaskVerificationsDto } from './dto/course-task-verifications.dto';
import { SelfEducationService } from './self-education.service';

export type VerificationEvent = {
  id: number;
  courseTask: {
    id: number;
    type: string;
    [key: string]: unknown;
  };
  studentId: number;
  githubId: string;
};

@Injectable()
export class TaskVerificationsService {
  constructor(
    @InjectRepository(TaskVerification)
    readonly taskVerificationsRepository: Repository<TaskVerification>,

    @InjectRepository(CourseTask)
    readonly courseTasksRepository: Repository<CourseTask>,

    @InjectRepository(Student)
    readonly studentsRepository: Repository<Student>,

    readonly cloudService: CloudApiService,

    readonly seflEducationService: SelfEducationService,
  ) {}

  public async getCourseTasksVerifications(courseId: number) {
    const verifications = await this.taskVerificationsRepository
      .createQueryBuilder('v')
      .select(['v.id', 'v.status', 'v.courseTaskId'])
      .innerJoin('v.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('v.student', 'student')
      .innerJoin('student.user', 'user')
      .addSelect([
        'student.id',
        'user.githubId',
        'task.name',
        'task.githubRepoName',
        'task.sourceGithubRepoUrl',
        'task.attributes',
        'courseTask.id',
      ])
      .where('courseTask.courseId = :courseId', { courseId })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .andWhere("v.status = 'pending' ")
      .orderBy('v.createdDate', 'ASC')
      .getMany();

    return verifications.map(verification => ({
      courseId: Number(courseId),
      id: verification.id,
      githubId: verification.student.user.githubId,
      courseTaskId: verification.courseTaskId,
      taskName: verification.courseTask.task.name,
      sourceGithubRepoUrl: verification.courseTask.task.sourceGithubRepoUrl,
      githubRepoName: verification.courseTask.task.githubRepoName,
      attributes: verification.courseTask.task.attributes,
    }));
  }

  public async updateVerification(id: number, data: { score: number; details: string; status: string }) {
    const score = Math.round(Number(data.score));
    await this.taskVerificationsRepository.save({ ...data, score, id } as Partial<TaskVerification>);

    return this.taskVerificationsRepository.findOneByOrFail({ id });
  }

  public async getAnswersByAttempts(courseTaskId: number, studentId: number): Promise<TaskVerificationAttemptDto[]> {
    const courseTask = await this.courseTasksRepository.findOneByOrFail({ id: courseTaskId });

    const now = new Date();
    const endDate = courseTask?.studentEndDate ? new Date(courseTask.studentEndDate) : null;

    if (endDate && isValid(endDate) && isBefore(now, endDate)) {
      throw new BadRequestException('The answers cannot be checked until the deadline has passed.');
    }

    const taskVerifications = await this.taskVerificationsRepository.find({
      select: ['createdDate', 'courseTaskId', 'score', 'answers', 'courseTask'],
      where: { courseTaskId, studentId },
      relations: ['courseTask', 'courseTask.task'],
      order: {
        createdDate: 'desc',
      },
    });

    if (taskVerifications && taskVerifications.length > 0) {
      const hasAnswers = taskVerifications.some(v => v.answers && v.answers.length > 0);

      if (!hasAnswers) {
        throw new BadRequestException('The answers are not available for this task.');
      }

      return taskVerifications.map(verification => {
        const questionsWithIncorrectAnswers: SelfEducationQuestionSelectedAnswersDto[] = verification.answers
          .filter(answer => !answer.isCorrect)
          .map(answer => {
            const taskQuestion = (
              verification.courseTask.task.attributes as {
                public: { questions: SelfEducationQuestionSelectedAnswersDto[] };
              }
            ).public.questions[answer.index];

            if (!taskQuestion) {
              return null;
            }

            return new SelfEducationQuestionSelectedAnswersDto({
              answers: taskQuestion.answers,
              selectedAnswers: Array.isArray(answer.value) ? answer.value : [answer.value],
              multiple: taskQuestion.multiple,
              question: taskQuestion.question,
              answersType: taskQuestion.answersType,
              questionImage: taskQuestion.questionImage,
            });
          })
          .filter((question): question is SelfEducationQuestionSelectedAnswersDto => question !== null);

        return new TaskVerificationAttemptDto(verification, questionsWithIncorrectAnswers);
      });
    }
    throw new BadRequestException('The answers cannot be checked if there were no attempts.');
  }

  public async createTaskVerification(
    courseTaskId: number,
    studentId: number,
    data: { githubId: string; body: Record<string, unknown> | unknown[] },
  ): Promise<{ id?: number }> {
    const [courseTask, student] = await Promise.all([
      this.courseTasksRepository.findOne({
        where: { id: courseTaskId },
        relations: ['task'],
      }),
      this.studentsRepository.findOneByOrFail({ id: studentId }),
    ]);

    if (courseTask == null || student == null) {
      throw new BadRequestException('No student or not valid course task');
    }

    if (courseTask.courseId !== student.courseId) {
      throw new BadRequestException(`Course task does not belong to the student's course`);
    }

    if (courseTask.studentStartDate && courseTask.studentStartDate > new Date()) {
      throw new BadRequestException(`Task Verification ${courseTask.task.name} not started`);
    }

    const existing = await this.taskVerificationsRepository.findOne({
      where: {
        status: 'pending',
        studentId,
        courseTaskId,
        updatedDate: MoreThan(subHours(new Date(), 1)),
      },
      select: ['id'],
    });

    if (existing != null) {
      throw new HttpException(`Task Verification [${existing.id}] is in progress`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const now = new Date();
    const endDate = courseTask?.studentEndDate ? new Date(courseTask.studentEndDate) : null;

    if (endDate && isValid(endDate) && isBefore(endDate, now)) {
      throw new BadRequestException(`Task Verification [${courseTask.id}] expired`);
    }

    if (courseTask.type === TaskType.SelfEducation) {
      await this.seflEducationService.createSelfEducationVerification({
        courseId: courseTask.courseId,
        courseTask,
        studentId: student.id,
        studentAnswers: data.body as SelfEducationAnswers,
      });
      return { id: undefined };
    }

    const { id } = await this.taskVerificationsRepository.save({
      studentId,
      courseTaskId,
      score: 0,
      status: 'pending',
    });

    const result: VerificationEvent = {
      id: id,
      githubId: data.githubId,
      studentId: student.id,
      courseTask: {
        ...data.body,
        id: courseTask.id,
        type: courseTask.type || courseTask.task.type,
        attributes: courseTask.task.attributes ?? {},
      },
    };

    await this.cloudService.submitTask([result]);

    return { id };
  }

  public async getStudentVerifications(
    courseId: number,
    githubId: string,
  ): Promise<CourseTaskVerificationsDto[] | null> {
    const student = await this.studentsRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (student == null) {
      return null;
    }

    const verifications = await this.taskVerificationsRepository
      .createQueryBuilder('v')
      .innerJoin('v.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .addSelect(['task.name', 'courseTask.id', 'courseTask.type'])
      .where('v.studentId = :id', { id: student.id })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .orderBy('v.updatedDate', 'DESC')
      .getMany();

    return this.groupVerificationsByCourseTask(verifications);
  }

  private groupVerificationsByCourseTask(verifications: TaskVerification[]): CourseTaskVerificationsDto[] {
    const byCourseTask = new Map<number, TaskVerification[]>();
    for (const verification of verifications) {
      const group = byCourseTask.get(verification.courseTaskId) ?? [];
      group.push(verification);
      byCourseTask.set(verification.courseTaskId, group);
    }

    return [...byCourseTask.entries()].map(([courseTaskId, verifications]) => ({ courseTaskId, verifications }));
  }
}
