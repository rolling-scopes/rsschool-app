import { BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Event } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { anyCourseManagerGuard } from '../guards';
import { setResponse } from '../utils';

const validateTaskId = async (ctx: Router.RouterContext, next: any) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Lecture Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

export function lectureRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/event' });

  router.get('/:id', anyCourseManagerGuard, validateTaskId, createGetRoute(Event, logger));
  router.post('/', anyCourseManagerGuard, createPostRoute(Event, logger));
  router.put('/:id', anyCourseManagerGuard, validateTaskId, createPutRoute(Event, logger));

  return router;
}
