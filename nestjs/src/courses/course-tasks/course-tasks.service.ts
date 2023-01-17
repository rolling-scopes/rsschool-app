import { Checker, CourseTask } from '@entities/courseTask';
import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  FindOptionsWhere,
  Not,
} from 'typeorm';
import * as dayjs from 'dayjs';
import { TaskResult } from '@entities/taskResult';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskType } from '@entities/task';
import { CourseTaskVerificationsDto } from './dto/course-task-verifications.dto';
import { TaskVerification } from '../../../../server/src/models';

export enum Status {
  Started = 'started',
  InProgress = 'inprogress',
  Finished = 'finished',
}

export enum CourseTaskStatusEnum {
  Available = 'Available',
  Missed = 'Missed',
  Done = 'Done',
}

export enum CourseTaskStateEnum {
  Uncompleted = 'Uncompleted',
  Missed = 'Missed',
  Completed = 'Completed',
}

@Injectable()
export class CourseTasksService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getAll(courseId: number, status?: 'started' | 'inprogress' | 'finished', useCache = false) {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false, ...this.getFindConditionForStatus(status) },
      relations: ['task', 'taskOwner'],
      order: {
        studentEndDate: 'ASC',
      },
      cache: useCache ? 60 * 1000 : undefined,
    });
  }

  public async getAllDetailed(courseId: number) {
    const [courseTasks, courseTaskResults] = await Promise.all([
      this.getAll(courseId),
      // get info about task results for each task
      this.courseTaskRepository
        .createQueryBuilder('ct')
        .select('ct.id', 'id')
        .addSelect('COUNT(r.id)', 'resultsCount')
        .addSelect('COUNT(i.id)', 'interviewResultsCount')
        .leftJoin(TaskResult, 'r', 'r.courseTaskId = ct.id')
        .leftJoin(TaskInterviewResult, 'i', 'i.courseTaskId = ct.id')
        .where('ct.courseId = :courseId', { courseId })
        .groupBy('ct.id')
        .getRawMany<{ id: number; resultsCount: number; interviewResultsCount: number }>(),
    ]);
    return courseTasks.map(courseTask => {
      const result = courseTaskResults.find(({ id }) => id === courseTask.id);
      return {
        ...courseTask,
        resultsCount: Number(result?.resultsCount || 0),
        interviewResultsCount: Number(result?.interviewResultsCount || 0),
      };
    });
  }

  public async getAllDetailedVerifications(courseId: number, studentId: number) {
    const data = await this.courseTaskRepository.find({
      relations: {
        task: true,
        taskVerifications: true,
      },
      where: {
        courseId,
        checker: Checker.AutoTest,
        type: Not(TaskType.Test),
        studentStartDate: LessThanOrEqual(dayjs().toISOString()),
        disabled: false,
        taskVerifications: {
          studentId,
        },
      },
      order: {
        studentEndDate: 'asc',
      },
    });

    return data.map(
      item =>
        new CourseTaskVerificationsDto(
          item,
          this.getState(item.studentEndDate, item.taskVerifications),
          this.getStatus(item.studentEndDate, item.taskVerifications),
        ),
    );
  }

  public getById(courseTaskId: number) {
    return this.courseTaskRepository.findOneOrFail({
      where: { id: courseTaskId },
      relations: ['task'],
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

  private getFindConditionForStatus(status?: 'started' | 'inprogress' | 'finished'): FindOptionsWhere<CourseTask> {
    const now = new Date().toISOString();
    let where: FindOptionsWhere<CourseTask> = {};

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

    const where: FindOptionsWhere<CourseTask> = {
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

  public createCourseTask(courseEvent: Partial<CourseTask>) {
    return this.courseTaskRepository.insert(courseEvent);
  }

  public updateCourseTask(id: number, courseEvent: Partial<CourseTask>) {
    return this.courseTaskRepository.update(id, courseEvent);
  }

  public disable(id: number) {
    return this.courseTaskRepository.update(id, {
      id, // required to get right update in subscription
      disabled: true,
    });
  }

  private getState(
    studentEndDate: string | Date | null,
    verifications: TaskVerification[] | null,
  ): CourseTaskStateEnum {
    const now = dayjs();
    const end = dayjs(studentEndDate);
    const attemptsCount = verifications?.length || 0;

    if (attemptsCount > 0) {
      return CourseTaskStateEnum.Completed;
    }

    if (now.isAfter(end) && !attemptsCount) {
      return CourseTaskStateEnum.Missed;
    }

    return CourseTaskStateEnum.Uncompleted;
  }

  private getStatus(
    studentEndDate: string | Date | null,
    verifications: TaskVerification[] | null,
  ): CourseTaskStatusEnum {
    const attemptsCount = verifications?.length || 0;
    const now = dayjs();
    const end = dayjs(studentEndDate);

    if (now.isAfter(end) && !attemptsCount) {
      return CourseTaskStatusEnum.Missed;
    }

    if (now.isAfter(end) && attemptsCount) {
      return CourseTaskStatusEnum.Done;
    }

    return CourseTaskStatusEnum.Available;
  }
}
