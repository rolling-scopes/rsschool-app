import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute } from '../common';
import { BestWork } from '../../models';
import { getBestWorksByTask } from './getBestWorksByTask';
import { addBestWork } from './addBestWork';
import { courseManagerGuard } from '../guards';
import { getBestWorks } from './getBestWorks';
import { getCourseList } from './getCourseList';
import { getTaskList } from './getTaskList';
import { putBestWork } from './putBestWork';

export function bestWorksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/bestWorks' });

  router.get('/', courseManagerGuard, getBestWorks(logger));
  router.post('/', courseManagerGuard, addBestWork(logger));
  router.put('/:id', courseManagerGuard, putBestWork(logger));
  router.delete('/:id', courseManagerGuard, createDeleteRoute(BestWork, logger));

  router.get('/course', courseManagerGuard, getCourseList(logger));
  router.get('/course/:id', courseManagerGuard, getTaskList(logger));

  router.get('/task/:taskId', courseManagerGuard, getBestWorksByTask(logger));

  return router;
}
