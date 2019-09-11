import { BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

const validateId = async (ctx: Router.RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Student Id]');
    return;
  }
  ctx.params.id = stageId;
  await next();
};

export function studentRoute(logger: ILogger) {
  const router = new Router({ prefix: '/student' });

  router.get('/:id', adminGuard, createGetRoute(Student, logger));

  router.post('/', adminGuard, createPostRoute(Student, logger));

  router.put('/:id', adminGuard, validateId, createPutRoute(Student, logger));

  return router;
}
