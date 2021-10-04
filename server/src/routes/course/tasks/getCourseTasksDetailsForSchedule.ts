import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTaskRepository } from '../../../repositories/courseTask.repository';
import { setResponse } from '../../utils';

export const getCourseTasksDetailsForSchedule = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId: number = ctx.state.user.id;
  const repository = getCustomRepository(CourseTaskRepository);
  const data = await repository.findForSchedule(courseId, userId);

  setResponse(ctx, StatusCodes.OK, data);
};
