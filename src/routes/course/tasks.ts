import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Course, CourseTask, Task } from '../../models';
import { ILogger } from '../../logger';
import { getRepository, In } from 'typeorm';
import { setResponse } from '../utils';

type CourseTaskDTO = {
  courseTaskId: number;
  name: string;
};

export const getTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const course = await getRepository(Course).findOne(courseId, {
    relations: ['stages', 'stages.courseTasks'],
  });
  const courseTaskIds: number[] = course!.stages
    .reduce<CourseTask[]>((acc, stage) => acc.concat(stage.courseTasks || []), [])
    .map(task => task.id);
  const courseTask = await getRepository(CourseTask).find({ where: { id: In(courseTaskIds) }, relations: ['task'] });

  if (course === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const data: CourseTaskDTO[] = courseTask.map(item => ({
    courseTaskId: item.id,
    name: (item.task as Task).name,
  }));

  setResponse(ctx, OK, data);
};
