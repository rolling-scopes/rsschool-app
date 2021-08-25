import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute } from '../common';
import { BestWork } from '../../models';
import { getBestWorksByTask } from './getBestWorksByTask';
import { addBestWork } from './addBestWork';
import { adminGuard } from '../guards';
import { getBestWorks } from './getBestWorks';
import { getCourseList } from './getCourseList';
import { getTaskList } from './getTaskList';

export function bestWorksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/bestWorks' });

  router.get('/', adminGuard, getBestWorks(logger));
  router.post('/', adminGuard, addBestWork(logger));
  router.delete('/:id', adminGuard, createDeleteRoute(BestWork, logger));

  router.get('/course', adminGuard, getCourseList(logger));
  router.get('/course/:id', adminGuard, getTaskList(logger));

  router.get('/task/:taskId', adminGuard, getBestWorksByTask(logger));

  return router;
}
