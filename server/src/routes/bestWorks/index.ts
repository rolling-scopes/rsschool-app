import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute, createPostRoute } from '../common';
import { BestWork } from '../../models';
import { getBestWorksByTask } from './getBestWorksByTask';

export function bestWorksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/bestWorks' });

  router.get('/task/:taskId', getBestWorksByTask(logger));
  router.post('/', createPostRoute(BestWork, logger));
  router.delete('/:id', createDeleteRoute(BestWork, logger));

  return router;
}
