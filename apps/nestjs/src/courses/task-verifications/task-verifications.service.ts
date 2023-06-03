import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { TaskVerification } from '@entities/taskVerification';
import { CourseTask } from '@entities/courseTask';
import { TaskVerificationAttemptDto } from './dto/task-verifications-attempts.dto';
import { SelfEducationQuestionSelectedAnswersDto } from './dto/self-education.dto';
import * as dayjs from 'dayjs';
import { Student } from '@entities/index';
import { TaskType } from '@entities/task';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';
import { SelfEducationService } from './self-education.service';

export type VerificationEvent = {
  id: number;
  courseTask: {
    id: number;
    type: string;
    [key: string]: any;
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

  public async getAnswersByAttempts(courseTaskId: number, studentId: number): Promise<TaskVerificationAttemptDto[]> {
    const courseTask = await this.courseTasksRepository.findOneByOrFail({ id: courseTaskId });

    const now = dayjs();
    const endDate = dayjs(courseTask?.studentEndDate);

    if (now.isBefore(endDate)) {
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
            const taskQuestion = (verification.courseTask.task.attributes as any).public.questions[answer.index];

            return new SelfEducationQuestionSelectedAnswersDto({
              answers: taskQuestion.answers,
              selectedAnswers: answer.value,
              multiple: taskQuestion.multiple,
              question: taskQuestion.question,
              answersType: taskQuestion.answersType,
              questionImage: taskQuestion.questionImage,
            });
          });

        return new TaskVerificationAttemptDto(verification, questionsWithIncorrectAnswers);
      });
    } else {
      throw new BadRequestException('The answers cannot be checked if there were no attempts.');
    }
  }

  public async createTaskVerification(
    courseTaskId: number,
    studentId: number,
    data: { githubId: string; body: any },
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

    const existing = await this.taskVerificationsRepository.findOne({
      where: {
        status: 'pending',
        studentId,
        courseTaskId,
        updatedDate: MoreThan(dayjs().add(-1, 'hour').toDate()),
      },
      select: ['id'],
    });

    if (existing != null) {
      throw new HttpException(`Task Verification [${existing.id}] is in progress`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const now = dayjs();
    const endDate = dayjs(courseTask?.studentEndDate);

    if (endDate.isBefore(now)) {
      throw new BadRequestException(`Task Verification [${courseTask.id}] expired`);
    }

    if (courseTask.type === TaskType.SelfEducation) {
      await this.seflEducationService.createSelfeducationVerification({
        courseId: courseTask.courseId,
        courseTask,
        studentId: student.id,
        studentAnswers: data.body,
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
}
