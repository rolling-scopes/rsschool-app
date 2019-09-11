import { BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { Event } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute, createDeleteRoute } from '../common';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

const validateTaskId = async (ctx: Router.RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Lecture Id]');
    return;
  }
  ctx.params.id = stageId;
  await next();
};

export function lectureRoute(logger: ILogger) {
  const router = new Router({ prefix: '/event' });

  router.get('/:id', adminGuard, validateTaskId, createGetRoute(Event, logger));
  router.post('/', adminGuard, createPostRoute(Event, logger));
  router.put('/:id', adminGuard, validateTaskId, createPutRoute(Event, logger));
  router.delete('/:id', adminGuard, validateTaskId, createDeleteRoute(Event, logger));

  return router;
}
