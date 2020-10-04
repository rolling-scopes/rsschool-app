import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { validateGithubIdAndAccess } from '../validators';
import { getCourses } from './courses';

export function userRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/user' });

  router.get('/:githubId/courses', guard, validateGithubIdAndAccess, getCourses(logger));

  return router;
}
