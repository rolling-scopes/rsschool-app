import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute } from '../common';
import { BestWork } from '../../models';
import { getBestWorksByTask } from './getBestWorksByTask';
import { addBestWork } from './addBestWork';
import { adminGuard } from '../guards';

export function bestWorksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/bestWorks' });

  router.get('/task/:taskId', getBestWorksByTask(logger));
  router.post('/', adminGuard, addBestWork(logger));
  router.delete('/:id', adminGuard, createDeleteRoute(BestWork, logger));

  return router;
}
