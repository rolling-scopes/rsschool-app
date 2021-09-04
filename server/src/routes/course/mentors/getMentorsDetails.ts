import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { courseService } from '../../../services';
import { setResponse } from '../../utils';

export const getMentorsDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const result = await courseService.getMentorsDetails(courseId);
  setResponse(ctx, StatusCodes.OK, result);
};
