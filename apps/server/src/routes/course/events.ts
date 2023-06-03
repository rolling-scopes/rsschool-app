// tslint:disable-next-line
import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';

export const getCourseEvent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const eventId: number = ctx.params.id;
  const data = await courseService.getEvent(eventId);

  setResponse(ctx, OK, data);
};

export const getCourseEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data = await courseService.getEvents(courseId);

  setResponse(ctx, OK, data);
};
