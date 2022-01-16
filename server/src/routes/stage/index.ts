import { BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Stage } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard, guard, RouterContext } from '../guards';
import { setResponse } from '../utils';

const validateStageId = async (ctx: RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Stage Id]');
    return;
  }
  ctx.params.id = stageId;
  await next();
};

export function stageRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/stage' });

  router.get('/:id', guard, createGetRoute(Stage, logger));

  router.post('/', adminGuard, createPostRoute(Stage, logger));

  router.put('/:id', adminGuard, validateStageId, createPutRoute(Stage, logger));

  return router;
}
