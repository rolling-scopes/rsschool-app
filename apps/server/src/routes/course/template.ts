import { ILogger } from '../../logger';
import Router from '@koa/router';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';

export const postCopyCourse = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;

  const courseCopy = await courseService.createCourseFromCopy(courseId, ctx.request.body);
  setResponse(ctx, OK, courseCopy.courseCopy, 60);
};
