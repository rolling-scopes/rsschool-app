import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Course, CourseTask, Task, Stage, TaskResult } from '../../models';
import { ILogger } from '../../logger';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

export const getCourseTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const course = await getRepository(Course).findOne(courseId, {
    relations: ['stages', 'stages.courseTasks'],
  });
  if (course === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const courseTaskIds: number[] = course!.stages
    .reduce<CourseTask[]>((acc, stage) => acc.concat(stage.courseTasks || []), [])
    .map(task => task.id);

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .addSelect('COUNT(taskResult.id)', 'taskResultCount')
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .innerJoinAndSelect('courseTask.task', 'task')
    .innerJoinAndSelect('courseTask.stage', 'stage')
    .where(`courseTask.id IN (${courseTaskIds.join(',')})`)
    .addGroupBy('courseTask.id')
    .addGroupBy('task.id')
    .addGroupBy('stage.id')
    .getRawAndEntities();

  const data = courseTasks.entities.map(item => {
    const raw = courseTasks.raw.find(t => t.courseTask_id === item.id);
    return {
      courseTaskId: item.id,
      taskId: (item.task as Task).id,
      name: (item.task as Task).name,
      maxScore: item.maxScore,
      scoreWeight: item.scoreWeight,
      stageId: (item.stage as Stage).id,
      githubPrRequired: !!(item.task as Task).githubPrRequired,
      verification: (item.task as Task).verification,
      description: (item.task as Task).description,
      descriptionUrl: (item.task as Task).descriptionUrl,
      studentStartDate: item.studentStartDate,
      studentEndDate: item.studentEndDate,
      taskResultCount: raw ? Number(raw.taskResultCount) : 0,
    };
  });

  setResponse(ctx, OK, data);
};

type PostTaskInput = {
  taskId: number;
  stageId: number;
  maxScore?: number;
  scoreWeight?: number;
  studentEndDate?: string;
};

export const postCourseTask = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: PostTaskInput = ctx.request.body;
  const courseTaskRepository = getRepository(CourseTask);
  const task: Partial<CourseTask> = {
    task: data.taskId,
    maxScore: data.maxScore,
    stage: data.stageId,
    scoreWeight: data.scoreWeight,
    studentEndDate: data.studentEndDate,
  };
  const createdResult = await courseTaskRepository.save(task);
  setResponse(ctx, OK, createdResult);
  return;
};

export const putCourseTask = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId: number = ctx.params.courseTaskId;
  const data: PostTaskInput = ctx.request.body;

  const courseTaskRepository = getRepository(CourseTask);
  const courseTask = await courseTaskRepository.findOne({ where: { id: courseTaskId } });
  if (courseTask == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  courseTask.stage = data.stageId;
  if (data.maxScore != null) {
    courseTask.maxScore = data.maxScore;
  }
  if (data.scoreWeight != null) {
    courseTask.scoreWeight = data.scoreWeight;
  }
  if (data.studentEndDate) {
    courseTask.studentEndDate = data.studentEndDate;
  }

  const updatedResult = await courseTaskRepository.save(courseTask);
  setResponse(ctx, OK, updatedResult);
};

export const deleteCourseTask = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId = Number(ctx.params.courseTaskId);
  const updatedResult = await getRepository(CourseTask).delete(courseTaskId);
  setResponse(ctx, OK, updatedResult);
};
