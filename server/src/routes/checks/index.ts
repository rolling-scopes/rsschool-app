import { getBadComment } from './getBadComment';
import { getMaxScoreCheckers } from './getMaxScoreCheckers';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { courseManagerGuard } from '../guards';

export function checksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/checks' });

  router.get('/badcomment/:courseId/:taskId', courseManagerGuard, getBadComment(logger));
  router.get('/maxscore/:courseId/:taskId', courseManagerGuard, getMaxScoreCheckers(logger));

  return router;
}
