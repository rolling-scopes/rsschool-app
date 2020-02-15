import { BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Task } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { guard, anyCourseManagerGuard } from '../guards';
import { setResponse } from '../utils';

const validateTaskId = async (ctx: Router.RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Task Id]');
    return;
  }
  ctx.params.id = stageId;
  await next();
};

export function taskRoute(logger: ILogger) {
  const router = new Router({ prefix: '/task' });

  router.get('/:id', guard, createGetRoute(Task, logger));

  router.post('/', anyCourseManagerGuard, createPostRoute(Task, logger));

  router.put('/:id', anyCourseManagerGuard, validateTaskId, createPutRoute(Task, logger));

  return router;
}
