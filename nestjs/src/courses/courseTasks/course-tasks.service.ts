import { Checker, CourseTask } from '@entities/courseTask';
import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindCondition,
  FindConditions,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import * as dayjs from 'dayjs';

export enum Status {
  Started = 'started',
  InProgress = 'inprogress',
  Finished = 'finished',
}

@Injectable()
export class CourseTasksService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getAll(courseId: number, status?: 'started' | 'inprogress' | 'finished') {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false, ...this.getFindConditionForStatus(status) },
      relations: ['task'],
      order: {
        studentEndDate: 'ASC',
      },
    });
  }

  public getByOwner(username: string) {
    return this.courseTaskRepository
      .createQueryBuilder('t')
      .leftJoin(User, 'u', 'u.id = t.taskOwnerId')
      .where(`t.checker = :checker`, { checker: Checker.TaskOwner })
      .andWhere('u.githubId = :username', { username })
      .getMany();
  }

  private getFindConditionForStatus(status?: 'started' | 'inprogress' | 'finished'): FindCondition<CourseTask> {
    const now = new Date().toISOString();
    let where: FindCondition<CourseTask> = {};

    switch (status) {
      case 'started':
        where = { ...where, studentStartDate: LessThanOrEqual(now) };
        break;
      case 'inprogress':
        where = { ...where, studentStartDate: LessThanOrEqual(now), studentEndDate: MoreThan(now) };
        break;
      case 'finished':
        where = { ...where, studentEndDate: LessThan(now) };
        break;
    }
    return where;
  }

  public getUpdatedTasks(courseId: number, lastHours: number) {
    const date = dayjs().subtract(lastHours, 'hours');

    return this.courseTaskRepository.find({
      where: { courseId, updatedDate: MoreThanOrEqual(date.toISOString()) },
      relations: ['task'],
    });
  }

  public getTasksPendingDeadline(
    courseId: number,
    { deadlineWithinHours = 24 }: { deadlineWithinHours?: number } = {},
  ) {
    const now = dayjs().toISOString();
    const endDate = dayjs().add(deadlineWithinHours, 'hours').toISOString();

    const where: FindConditions<CourseTask> = {
      courseId,
      disabled: false,
      studentStartDate: LessThanOrEqual(now),
      studentEndDate: Between(now, endDate),
    };

    return this.courseTaskRepository.find({
      where,
      relations: ['task', 'taskSolutions'],
      order: {
        studentEndDate: 'ASC',
      },
    });
  }
}
