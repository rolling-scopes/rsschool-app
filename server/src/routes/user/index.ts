import Router from 'koa-router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { validateGithubId } from '../validators';
import { getCourses } from './courses';

export function userRoute(logger: ILogger) {
  const router = new Router({ prefix: '/user' });

  router.get('/:githubId/courses', guard, validateGithubId, getCourses(logger));

  return router;
}
