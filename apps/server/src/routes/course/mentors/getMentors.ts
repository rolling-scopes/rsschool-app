import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { courseService } from '../../../services';
import { setResponse } from '../../utils';

export const getMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const result = await courseService.getMentors(courseId);
  setResponse(ctx, StatusCodes.OK, result);
};
