import { getBadComment } from './getBadComment';
import { getMaxScoreCheckers } from './getMaxScoreCheckers';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { courseManagerGuard } from '../guards';

export function checksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/checks' });

  router.get('/maxscore/:taskId', courseManagerGuard, getMaxScoreCheckers(logger));
  router.get('/badcomment/:taskId', courseManagerGuard, getBadComment(logger));

  return router;
}
