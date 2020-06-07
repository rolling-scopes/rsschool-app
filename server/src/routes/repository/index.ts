import Router from '@koa/router';
import { ILogger } from '../../logger';
import { basicAuthAws } from '../guards';
import { createRepositoryEvents } from './events';

export function repositoryRoute(logger: ILogger) {
  const router = new Router({ prefix: '/repository' });

  router.post('/events', basicAuthAws, createRepositoryEvents(logger));

  return router;
}
