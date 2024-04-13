import { Checker, CourseTask, CrossCheckStatus } from '@entities/courseTask';
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
  In,
} from 'typeorm';
import * as dayjs from 'dayjs';
import { TaskResult } from '@entities/taskResult';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskSolution } from '@entities/taskSolution';
import { StageInterview } from '@entities/index';

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
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
  ) {}

  public getAll(courseId: number, status?: 'started' | 'inprogress' | 'finished', useCache = false) {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false, ...this.getFindConditionForStatus(status) },
      relations: ['task', 'taskOwner'],
      order: {
        studentEndDate: 'ASC',
        studentStartDate: 'ASC',
      },
      cache: useCache ? 60 * 1000 : undefined,
    });
  }

  public async getAllWithStudentSolution(
    courseId: number,
    studentId: number,
    status?: 'started' | 'inprogress' | 'finished',
    useCache = false,
  ) {
    const courseTasks = await this.getAll(courseId, status, useCache);
    const taskSolutions = await this.taskSolutionRepository.findBy({
      courseTaskId: In(courseTasks.map(courseTask => courseTask.id)),
      studentId,
    });

    const studentCourseTaskSolutions = courseTasks.map(courseTask => {
      const taskSolution = taskSolutions.find(({ courseTaskId }) => courseTaskId === courseTask.id);
      return { ...courseTask, ...(taskSolution && { taskSolutions: [taskSolution] }) };
    });

    return studentCourseTaskSolutions;
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
        .addSelect('COUNT(CASE WHEN si.score > 0 THEN 1 END)', 'stageInterviewResultsCount')
        .leftJoin(TaskResult, 'r', 'r.courseTaskId = ct.id')
        .leftJoin(TaskInterviewResult, 'i', 'i.courseTaskId = ct.id')
        .leftJoin(StageInterview, 'si', 'si.courseTaskId = ct.id')
        .where('ct.courseId = :courseId', { courseId })
        .groupBy('ct.id')
        .getRawMany<{
          id: number;
          resultsCount: number;
          interviewResultsCount: number;
          stageInterviewResultsCount: number;
        }>(),
    ]);
    return courseTasks.map(courseTask => {
      const result = courseTaskResults.find(({ id }) => id === courseTask.id);
      return {
        ...courseTask,
        resultsCount: Number(result?.resultsCount || 0),
        interviewResultsCount: Number(result?.interviewResultsCount || 0),
        stageInterviewResultsCount: Number(result?.stageInterviewResultsCount ?? 0),
      };
    });
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
    { deadlineWithinHours = 24, safeBuffer = 1 }: { deadlineWithinHours?: number; safeBuffer?: number } = {},
  ) {
    const now = dayjs();
    const endDate = dayjs().add(deadlineWithinHours, 'hours').toISOString();

    const where: FindOptionsWhere<CourseTask> = {
      courseId,
      disabled: false,
      studentStartDate: LessThanOrEqual(now.toISOString()),
      studentEndDate: Between(now.add(safeBuffer, 'hours').toISOString(), endDate),
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

  public getAvailableCrossChecks(courseId: number) {
    return this.courseTaskRepository.find({
      where: { courseId, checker: Checker.CrossCheck, crossCheckStatus: CrossCheckStatus.Distributed, disabled: false },
      relations: { task: true },
      select: {
        id: true,
        task: {
          name: true,
        },
      },
    });
  }
}
