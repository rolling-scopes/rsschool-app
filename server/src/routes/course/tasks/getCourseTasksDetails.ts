import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTaskRepository } from '../../../repositories/courseTask.repository';
import { setResponse } from '../../utils';

export const getCourseTasksDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const repository = getCustomRepository(CourseTaskRepository);
  const data = await repository.findWithDetails(courseId);

  setResponse(ctx, StatusCodes.OK, data);
};
