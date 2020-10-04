import Router from '@koa/router';
import { ILogger } from '../../logger';
import { TaskVerification } from '../../models';
import { createPostRoute } from '../common';
import { adminGuard } from '../guards';

export function taskVerification(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/task-verification' });

  router.post('/', adminGuard, createPostRoute(TaskVerification, logger));

  return router;
}
