import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';

import { MentorBasic } from '@common/models';

import { AuthUser, Role, CourseRole } from '../../auth';
import { PersonDto } from 'src/core/dto';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { CourseTask, Task, TaskResult } from '../../../../server/src/models';
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

  public getStudentsByMentorAndCourse(mentorId: number, courseId: number) {
    return this.studentRepository.find({
      where: { mentorId, courseId },
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

  private async getTaskResultsByStudentsIds(studentsIds?: number[]) {
    if (!studentsIds) {
      return [];
    }

    return this.taskResultRepository.find({
      where: { studentId: In(studentsIds) },
      relations: ['courseTask'],
    });
  }

  private async getTasks(courseTaskIds?: number[]) {
    if (!courseTaskIds) {
      return [];
    }

    return this.taskRepository.find({
      where: { id: In(courseTaskIds) },
    });
  }

  private async getTasksByStudentsIds(studentsIds?: number[]) {
    const taskResults = await this.getTaskResultsByStudentsIds(studentsIds);
    const mentorTaskResults = taskResults.filter(tr => tr.courseTask.checker === Checker.Mentor);
    const courseTaskIds = mentorTaskResults.map(tr => tr.courseTask.taskId);
    const tasks = await this.getTasks(courseTaskIds);

    return { tasks, taskResults: mentorTaskResults };
  }

  public async getAll(mentorId: number, courseId: number): Promise<MentorDashboardDto[]> {
    const students = await this.getStudentsByMentorAndCourse(mentorId, courseId);
    const studentsIds = students.map(s => s.id);
    const { tasks, taskResults } = await this.getTasksByStudentsIds(studentsIds);

    if (taskResults) {
      return taskResults.map(taskResult => {
        const { courseTask } = taskResult;
        const task = tasks.find(t => t.id === courseTask.taskId) || ({} as Task);
        const student = students.find(st => st.id === taskResult.studentId) || ({} as Student);
        return new MentorDashboardDto(task, courseTask, taskResult, student);
      });
    }

    return [];
  }
}
