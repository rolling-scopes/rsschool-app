import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { TaskResult } from '../../../../server/src/models';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
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

  private async getTaskResults(studentId: number | undefined): Promise<TaskResult[]> {
    if (!studentId) {
      return [];
    }
    return this.taskResultRepository.find({
      where: { studentId },
      select: ['id', 'score', 'studentId', 'courseTaskId', 'githubPrUrl'],
    });
  }

  private async getDataByStudent(courseId: number, studentId: number): Promise<any> {
    // const [courseTasks, courseEvents] = await Promise.all([
    //   this.getActiveCourseTasks(courseId, studentId),
    //   this.getCourseEvents(courseId, studentId),
    // ]);
    const [taskResults] = await Promise.all([this.getTaskResults(studentId)]);
    // this.getTaskResults(studentId),
    // this.getInterviewResults(studentId),
    // this.getPrescreeningResults(studentId),
    // this.getTaskCheckers(studentId),

    return taskResults;
  }

  public async getAll(mentorId: number, courseId: number): Promise<MentorDashboardDto[]> {
    const data: MentorDashboardDto[] = [];
    const students = await this.getStudents(mentorId);

    for (const student of students) {
      const taskResults = await this.getDataByStudent(courseId, student.id);

      for (const taskResult of taskResults) {
        data.push(new MentorDashboardDto(taskResult, student));
      }
    }

    return data;
  }
}
