import { getBadComment } from './getBadComment';
import { getMaxScoreCheckers } from './getMaxScoreCheckers';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';

export function checksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/checks' });

  router.get('/maxscore/:taskId', adminGuard, getMaxScoreCheckers(logger));
  router.get('/badcomment/:taskId', adminGuard, getBadComment(logger));

  return router;
}
