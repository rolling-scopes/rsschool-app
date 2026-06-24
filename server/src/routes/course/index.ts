import Router from '@koa/router';
import { ILogger } from '../../logger';
import { basicAuthAws } from '../guards';
import { getCourseTasksVerifications } from './taskVerifications';

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  addTaskApi(router, logger);
  return router;
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
}
