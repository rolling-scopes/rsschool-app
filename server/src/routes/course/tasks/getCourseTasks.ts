import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTaskRepository } from '../../../repositories/courseTask.repository';
import { setResponse } from '../../utils';

export const getCourseTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const repository = getCustomRepository(CourseTaskRepository);

  const status: 'started' | 'inprogress' | 'finished' = ctx.query.status;
  const data = await repository.findByCourseId(courseId, status);

  setResponse(ctx, StatusCodes.OK, data);
};
