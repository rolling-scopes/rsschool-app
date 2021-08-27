import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute } from '../common';
import { BestWork } from '../../models';
import { getBestWorksByTask } from './getBestWorksByTask';
import { addBestWork } from './addBestWork';
import { anyCoursePowerUserGuard } from '../guards';
import { getBestWorks } from './getBestWorks';
import { getCourseList } from './getCourseList';
import { getTaskList } from './getTaskList';
import { putBestWork } from './putBestWork';

export function bestWorksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/bestWorks' });

  router.get('/', anyCoursePowerUserGuard, getBestWorks(logger));
  router.post('/', anyCoursePowerUserGuard, addBestWork(logger));
  router.put('/:id', anyCoursePowerUserGuard, putBestWork(logger));
  router.delete('/:id', anyCoursePowerUserGuard, createDeleteRoute(BestWork, logger));

  router.get('/course', anyCoursePowerUserGuard, getCourseList(logger));
  router.get('/course/:id', anyCoursePowerUserGuard, getTaskList(logger));

  router.get('/task/:taskId', anyCoursePowerUserGuard, getBestWorksByTask(logger));

  return router;
}
