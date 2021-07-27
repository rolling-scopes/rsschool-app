import { getBadReview } from './getBadReview';
import Router from '@koa/router';
import { ILogger } from '../../logger';
// import { adminGuard } from '../guards';

export function checksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/checks' });

  router.get('/:taskId', getBadReview(logger));

  return router;
}
