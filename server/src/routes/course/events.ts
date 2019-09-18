import { OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseEvent } from '../../models';
import { setResponse } from '../utils';

export const getCourseEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const data = await getRepository(CourseEvent).find({ where: { courseId }, relations: ['stage', 'event'] });

  setResponse(ctx, OK, data);
};
