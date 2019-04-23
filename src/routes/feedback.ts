import * as Router from 'koa-router';
import { Feedback } from '../models';
import { ILogger } from '../logger';
import { createGetRoute, createPostRoute } from './common';

export function feedbackRouter(logger: ILogger) {
  const router = new Router({ prefix: '/v2/feedback' });

  router.get('/:id', createGetRoute(Feedback, logger));
  router.post('/', createPostRoute(Feedback, logger));

  return router;
}
