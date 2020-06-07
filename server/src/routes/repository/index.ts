import Router from '@koa/router';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';
import { createRepositoryEvents } from './event';

export function repositoryRoute(logger: ILogger) {
  const router = new Router({ prefix: '/repository' });

  router.post('/events', adminGuard, createRepositoryEvents(logger));

  return router;
}
