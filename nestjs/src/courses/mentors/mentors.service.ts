import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { CourseTask, Checker } from '@entities/courseTask';
import { Task } from '@entities/task';
import { TaskResult } from '@entities/taskResult';
import { TaskSolution } from '@entities/taskSolution';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { StudentDto } from '../students/dto';

export interface StudentTaskSolutionItem {
  maxScore: number;
  taskName: string;
  taskDescriptionUrl: string;
  courseTaskId: number;
  resultScore: number | null;
  solutionUrl: string | null;
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

  private getCourseStudents(mentorId: number, courseId: number) {
    return this.studentRepository.find({
      where: { mentorId, courseId },
      relations: ['user'],
    });
  }

  private async getTaskSolutionByStudentId(studentId: number): Promise<StudentTaskSolutionItem[]> {
    const tasks = await this.taskSolutionRepository
      .createQueryBuilder('ts')
      .leftJoin(TaskResult, 'tr', 'tr."studentId" = ts."studentId"')
      .innerJoin(CourseTask, 'ct', 'ct.id = ts."courseTaskId"')
      .innerJoin(Task, 't', 't.id = ct."taskId"')
      .select(['t.name', 't.descriptionUrl', 'ct.id', 'ct.maxScore', 'ts.studentId', 'tr.score', 'ts.url'])
      .where('ts."studentId" = :studentId', { studentId })
      .andWhere('ct.checker = :checker', { checker: Checker.Mentor })
      .getRawMany();

    return tasks.map(task => ({
      taskName: task.t_name,
      courseTaskId: task.ct_id,
      maxScore: task.ct_maxScore,
      resultScore: task.tr_score,
      solutionUrl: task.ts_url,
      taskDescriptionUrl: task.t_descriptionUrl,
    }));
  }

  public async getStudentsTasks(mentorId: number, courseId: number): Promise<MentorDashboardDto[]> {
    const data: MentorDashboardDto[] = [];
    const students = await this.getCourseStudents(mentorId, courseId);

    if (!students) {
      return [];
    }

    for (const student of students) {
      const taskSolutions = await this.getTaskSolutionByStudentId(student.id);
      const items = taskSolutions.map(ts => new MentorDashboardDto(new StudentDto(student), ts));
      data.push(...items);
    }

    return data;
  }
}
