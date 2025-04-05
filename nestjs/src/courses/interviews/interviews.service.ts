import { In, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterviewPair, InterviewStatus, StageInterviewFeedbackJson } from '@common/models';
import { CourseTask } from '@entities/courseTask';
import { StageInterview } from '@entities/stageInterview';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskChecker } from '@entities/taskChecker';
import { UsersService } from 'src/users/users.service';
import { StageInterviewStudent, Student } from '@entities/index';
import { AvailableStudentDto } from './dto/available-student.dto';
import { TaskType } from '@entities/task';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(TaskInterviewStudent)
    readonly taskInterviewStudentRepository: Repository<TaskInterviewStudent>,
    @InjectRepository(TaskChecker)
    readonly taskCheckerRepository: Repository<TaskChecker>,
    @InjectRepository(TaskInterviewResult)
    readonly taskInterviewResultRepository: Repository<TaskInterviewResult>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(StageInterviewStudent)
    readonly stageInterviewStudentRepository: Repository<StageInterviewStudent>,
  ) {}

  public getAll(
    courseId: number,
    filter: {
      disabled?: boolean;
      types?: TaskType[];
    },
  ) {
    const { disabled = false, types = [TaskType.Interview] } = filter;
    return this.courseTaskRepository.find({
      where: { courseId, type: In(types), disabled },
      relations: ['task'],
    });
  }

  public getById(id: number) {
    return this.courseTaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });
  }

  public static getLastStageInterview = (stageInterviews: StageInterview[]) => {
    const [lastInterview] = stageInterviews
      .filter(interview => interview.isCompleted)
      .map(({ stageInterviewFeedbacks, score, courseTask }) =>
        stageInterviewFeedbacks.map(feedback => ({
          date: feedback.updatedDate,
          rating:
            score ??
            InterviewsService.getInterviewRatings(JSON.parse(feedback.json) as StageInterviewFeedbackJson).rating,
          version: feedback.version,
          maxScore: courseTask?.maxScore,
        })),
      )
      .reduce((acc, cur) => acc.concat(cur), [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return lastInterview;
  };

  public async getInterviewRegisteredStudents(courseId: number, courseTaskId: number): Promise<AvailableStudentDto[]> {
    const records = await this.taskInterviewStudentRepository
      .createQueryBuilder('is')
      .innerJoin('is.student', 'student')
      .innerJoin('student.user', 'user')
      .leftJoin('student.taskChecker', 'taskChecker')
      .addSelect([
        'student.id',
        'student.totalScore',
        'student.mentorId',
        ...UsersService.getPrimaryUserFields(),
        'taskChecker.id',
      ])
      .where('is.courseId = :courseId', { courseId })
      .andWhere('is.courseTaskId = :courseTaskId', { courseTaskId })
      .andWhere('student.isExpelled = false')
      .andWhere('taskChecker.id IS NULL')
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(record => ({
      id: record.student.id,
      name: UsersService.getFullName(record.student.user),
      githubId: record.student.user.githubId,
      cityName: record.student.user.cityName,
      countryName: record.student.user.countryName,
      totalScore: record.student.totalScore,
      registeredDate: record.createdDate,
    }));
  }

  public async getInterviewPairs(courseTaskId: number): Promise<InterviewPair[]> {
    const records = await this.taskCheckerRepository
      .createQueryBuilder('tc')
      .leftJoin('tc.mentor', 'mentor')
      .leftJoin('tc.student', 'student')
      .leftJoin('mentor.user', 'mentorUser')
      .leftJoin('student.user', 'studentUser')
      .leftJoin(TaskInterviewResult, 'tir', 'tc.studentId = tir.studentId AND tc.courseTaskId = tir.courseTaskId')
      .addSelect([
        'tc.id',
        'tir.score',
        'mentorUser.id',
        'mentorUser.firstName',
        'mentorUser.lastName',
        'mentorUser.githubId',
        'studentUser.id',
        'studentUser.firstName',
        'studentUser.lastName',
        'studentUser.githubId',
      ])
      .where('tc.courseTaskId = :courseTaskId', { courseTaskId })
      .getRawMany();

    return records.map(record => ({
      id: record.tc_id,
      result: record.tir_score || null,
      status: record.tir_score ? InterviewStatus.Completed : InterviewStatus.NotCompleted,
      interviewer: {
        id: record.mentorUser_id,
        githubId: record.mentorUser_githubId,
        name: UsersService.getFullName({
          firstName: record.mentorUser_firstName,
          lastName: record.mentorUser_lastName,
        }),
      },
      student: {
        id: record.studentUser_id,
        githubId: record.studentUser_githubId,
        name: UsersService.getFullName({
          firstName: record.studentUser_firstName,
          lastName: record.studentUser_lastName,
        }),
      },
    }));
  }

  /**
   * TODO: rewrite it. Hard to maintain and understand
   */
  public async getStageInterviewAvailableStudents(courseId: number): Promise<AvailableStudentDto[]> {
    const { entities, raw } = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin(StageInterviewStudent, 'sis', 'sis.studentId = student.id')
      .innerJoin('student.user', 'user')
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .leftJoin('si.courseTask', 'courseTask')
      .addSelect([
        ...UsersService.getPrimaryUserFields(),
        'si.id',
        'si.isGoodCandidate',
        'si.isCompleted',
        'si.isCanceled',
        'si.score',
        'sif.json',
        'sif.updatedDate',
        'sif.version',
        'sis.createdDate',
        'courseTask.maxScore',
      ])
      .where(
        [
          `student.courseId = :courseId`,
          `student.isFailed = false`,
          `student.isExpelled = false`,
          `student.mentorId IS NULL`,
          `student.mentoring <> false`,
        ].join(' AND '),
        { courseId },
      )
      .orderBy('student.totalScore', 'DESC')
      .getRawAndEntities();

    const result = entities
      .filter(s => {
        return (
          !s.stageInterviews ||
          s.stageInterviews.length === 0 ||
          s.stageInterviews.every(i => i.isCompleted || i.isCanceled)
        );
      })
      .map(student => {
        const { id, user, totalScore } = student;
        const stageInterviews: StageInterview[] = student.stageInterviews || [];
        const lastStageInterview = InterviewsService.getLastStageInterview(stageInterviews);
        return {
          id,
          totalScore,
          githubId: user.githubId,
          name: UsersService.getFullName(student.user),
          cityName: user.cityName,
          countryName: user.countryName,
          isGoodCandidate: this.isGoodCandidate(stageInterviews),
          rating: lastStageInterview?.rating,
          maxScore: lastStageInterview?.maxScore,
          feedbackVersion: lastStageInterview?.version,
          registeredDate: raw.find(item => item.student_id === student.id)?.sis_createdDate,
        };
      });

    return result;
  }

  /**
   * @deprecated - should be removed once Artsiom A. makes migration of the legacy feedback format
   */
  private static getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
    const commonSkills = Object.values(skills?.common ?? {}).filter(Boolean) as number[];
    const dataStructuresSkills = Object.values(skills?.dataStructures ?? {}).filter(Boolean) as number[];

    const htmlCss = skills?.htmlCss.level;
    const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
    const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

    if (resume?.score !== undefined) {
      const rating = resume.score;
      return { rating, htmlCss, common, dataStructures };
    }

    const ratingsCount = 4;
    const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];
    const rating = (ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0) * 10;

    return { rating, htmlCss, common, dataStructures };
  }

  private isGoodCandidate(stageInterviews: StageInterview[]) {
    return stageInterviews.some(i => i.isCompleted && i.isGoodCandidate);
  }

  public async registerStudentToStageInterview(courseId: number, githubId: string) {
    const student = await this.studentRepository.findOneOrFail({ where: { courseId, user: { githubId } } });
    if (student.isExpelled) {
      throw new BadRequestException('Student is expelled');
    }

    const studentId = student.id;
    const record = await this.stageInterviewStudentRepository.findOne({ where: { courseId, studentId } });
    if (record) {
      throw new BadRequestException('Student is already registered');
    }
    await this.stageInterviewStudentRepository.insert({ courseId, studentId });
    return this.stageInterviewStudentRepository.findOneByOrFail({ courseId, studentId });
  }

  public async registerStudentToInterview(courseId: number, courseTaskId: number, githubId: string) {
    const student = await this.studentRepository.findOneOrFail({ where: { courseId, user: { githubId } } });
    if (student.isExpelled) {
      throw new BadRequestException('Student is expelled');
    }

    const record = await this.taskInterviewStudentRepository.findOne({
      where: { courseId, studentId: student.id, courseTaskId },
    });
    if (record) {
      throw new BadRequestException('Student is already registered');
    }

    const taskInterviewStudent = await this.taskInterviewStudentRepository.save({
      courseId,
      studentId: student.id,
      courseTaskId,
    });
    return taskInterviewStudent;
  }
}
