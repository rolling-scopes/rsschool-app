import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { CourseTask, Checker } from '@entities/courseTask';
import { TaskResult } from '@entities/taskResult';
import { TaskSolution } from '@entities/taskSolution';
import { Task } from '@entities/task';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import * as dayjs from 'dayjs';
import { User } from '../../../../server/src/models';

export interface SolutionItem {
  maxScore: number;
  taskName: string;
  taskDescriptionUrl: string;
  courseTaskId: number;
  resultScore: number | null;
  solutionUrl: string;
  status: SolutionItemStatus;
  endDate: string;
  person: PersonDto;
}

export enum SolutionItemStatus {
  InReview = 'in-review',
  Done = 'done',
}

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
  ) {}

  public static convertMentorToMentorBasic(mentor: Mentor): MentorBasic {
    const user = mentor.user;
    return {
      isActive: !mentor.isExpelled,
      name: PersonDto.getName(user),
      id: mentor.id,
      githubId: user.githubId,
      students: mentor.students?.filter(s => !s.isExpelled && !s.isFailed).map(s => ({ id: s.id })) ?? [],
      cityName: user.cityName ?? '',
      countryName: user.countryName ?? '',
    };
  }

  public getById(mentorId: number) {
    return this.mentorsRepository.findOne({
      where: { id: mentorId },
    });
  }

  public getByUserId(courseId: number, userId: number) {
    return this.mentorsRepository.findOne({
      where: { courseId, userId },
    });
  }

  public getStudents(mentorId: number) {
    return this.studentRepository.find({
      where: { mentorId },
      relations: ['user', 'feedbacks'],
    });
  }

  public async canAccessMentor(user: AuthUser, mentorId: number): Promise<boolean> {
    const mentor = await this.getById(mentorId);
    if (mentor == null) {
      return false;
    }

    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    const { courseId } = mentor;
    const courseInfo = user.courses?.[courseId];
    const currentMentorId = user.courses?.[courseId]?.mentorId;

    if (courseInfo?.roles.includes(CourseRole.Manager)) {
      return true;
    }

    if (courseInfo?.roles.includes(CourseRole.Supervisor)) {
      return true;
    }

    return mentorId === currentMentorId;
  }

  public getCourseStudentsCount(mentorId: number, courseId: number) {
    return this.studentRepository.count({
      where: { mentorId, courseId },
    });
  }

  private async getSolutions(courseId: number, mentorId?: number | null): Promise<SolutionItem[]> {
    const query = this.taskSolutionRepository
      .createQueryBuilder('ts')
      .leftJoin(TaskResult, 'tr', 'tr."studentId" = ts."studentId" AND tr."courseTaskId" = ts."courseTaskId"')
      .innerJoin(CourseTask, 'ct', 'ct.id = ts."courseTaskId"')
      .innerJoin(Task, 't', 't.id = ct."taskId"')
      .innerJoin(Student, 's', 's.id = ts."studentId"')
      .innerJoin(User, 'u', 'u.id = s."userId"')
      .select([
        'u.id',
        'u."firstName"',
        'u."lastName"',
        'u."githubId"',
        't.name',
        't.descriptionUrl',
        'ct.id',
        'ct.maxScore',
        'ct.studentEndDate',
        'ts.studentId',
        'tr.score',
        'ts.url',
      ])
      .where('s."courseId" = :courseId', { courseId })
      .andWhere('ct.checker = :checker', { checker: Checker.Mentor });

    if (mentorId) {
      query.andWhere('s."mentorId" = :mentorId', { mentorId });
    }

    if (!mentorId) {
      query.limit(1);
    }

    const solutions = await query.getRawMany();

    return solutions.map(s => ({
      taskName: s.t_name,
      courseTaskId: s.ct_id,
      maxScore: s.ct_maxScore,
      resultScore: s.tr_score,
      solutionUrl: s.ts_url,
      taskDescriptionUrl: s.t_descriptionUrl,
      status: s.tr_score ? SolutionItemStatus.Done : SolutionItemStatus.InReview,
      endDate: dayjs(s.ct_studentEndDate).add(2, 'w').toISOString(),
      person: new PersonDto({
        id: s.u_id,
        firstName: s.u_firstname,
        lastName: s.u_lastName,
        githubId: s.u_githubId,
      }),
    }));
  }

  public async getStudentsTasks(mentorId: number, courseId: number): Promise<MentorDashboardDto[]> {
    const solutions = await this.getSolutions(courseId, mentorId);
    return solutions.map(solution => new MentorDashboardDto(solution));
  }

  public async getRandomTask(courseId: number): Promise<MentorDashboardDto | null> {
    const [solution] = await this.getSolutions(courseId);

    if (!solution) {
      return null;
    }

    return new MentorDashboardDto(solution);
  }
}
