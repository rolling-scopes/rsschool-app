// tslint:disable-next-line
import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';

export const getCourseEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data = await courseService.getEvents(courseId);

  setResponse(ctx, OK, data);
};
