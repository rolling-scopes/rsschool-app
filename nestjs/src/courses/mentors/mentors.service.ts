import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { TaskSolution } from '@entities/taskSolution';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';

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

  private async getTaskSolutions(studentId: number | undefined): Promise<TaskSolution[]> {
    if (!studentId) {
      return [];
    }
    return this.taskSolutionRepository.find({
      where: { studentId },
      select: ['id', 'url', 'courseTaskId', 'studentId'],
    });
  }

  public async getDataByStudent(courseId: number, studentId?: number): Promise<any> {
    // const [courseTasks, courseEvents] = await Promise.all([
    //   this.getActiveCourseTasks(courseId, studentId),
    //   this.getCourseEvents(courseId, studentId),
    // ]);
    const [taskSolutions] = await Promise.all([this.getTaskSolutions(studentId)]);
    // this.getTaskResults(studentId),
    // this.getInterviewResults(studentId),
    // this.getPrescreeningResults(studentId),
    // this.getTaskCheckers(studentId),

    return taskSolutions;
  }
}
