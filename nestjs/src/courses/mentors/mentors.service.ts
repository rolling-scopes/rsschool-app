import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { CourseTask, Task, TaskResult, TaskSolution } from '../../../../server/src/models';
import { Checker } from '../../../../server/src/models/courseTask';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(Task)
    readonly taskRepository: Repository<Task>,
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

  private getStudentsByMentorAndCourse(mentorId: number, courseId: number) {
    return this.studentRepository.find({
      where: { mentorId, courseId },
      relations: ['user'],
    });
  }

  private async getTaskResultsByStudentsIds(studentsIds?: number[]) {
    if (!studentsIds) {
      return [];
    }

    return this.taskResultRepository.find({
      where: { studentId: In(studentsIds) },
      select: ['courseTaskId', 'score'],
    });
  }

  private async getTaskSolutionsByStudentsIds(studentsIds?: number[]) {
    if (!studentsIds) {
      return [];
    }

    return this.taskSolutionRepository.find({
      where: { studentId: In(studentsIds) },
      select: ['courseTaskId', 'url'],
    });
  }

  private async getCourseTasks(courseTaskIds?: number[]) {
    if (!courseTaskIds) {
      return [];
    }

    return this.courseTaskRepository.find({
      where: { id: In(courseTaskIds), checker: Checker.Mentor },
      relations: ['task'],
    });
  }

  private async getTasksByStudentsIds(studentsIds?: number[]) {
    const [taskResults, taskSolutions] = await Promise.all([
      this.getTaskResultsByStudentsIds(studentsIds),
      this.getTaskSolutionsByStudentsIds(studentsIds),
    ]);

    const courseTaskIds = [
      ...new Set([...taskResults.map(tr => tr.courseTaskId), ...taskSolutions.map(ts => ts.courseTaskId)]),
    ];

    const courseTasks = await this.getCourseTasks(courseTaskIds);

    return { courseTasks, taskResults, taskSolutions };
  }

  public async getAll(mentorId: number, courseId: number): Promise<MentorDashboardDto[]> {
    const students = await this.getStudentsByMentorAndCourse(mentorId, courseId);

    if (!students) {
      return [];
    }

    const studentsIds = students.map(s => s.id);
    const { courseTasks, taskResults, taskSolutions } = await this.getTasksByStudentsIds(studentsIds);

    if (!courseTasks) {
      return [];
    }

    const student = students.find(s => s.courseId === courseId);

    if (!student) {
      return [];
    }

    return courseTasks.map(courseTask => {
      const { task, id: courseTaskId } = courseTask;

      const taskResult = taskResults.find(tr => tr.courseTaskId === courseTaskId);
      const taskSolution = taskSolutions.find(tr => tr.courseTaskId === courseTaskId);

      return new MentorDashboardDto(student, task, courseTask, taskResult, taskSolution);
    });
  }
}
