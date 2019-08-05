export * from './logging';

import * as Router from 'koa-router';
import { errorHandlerMiddleware } from './logging';
import { publicMeRouter } from './me';
import { courseRoute } from './course';
import { coursesRoute } from './courses';
import { authRoute } from './auth';
import { usersRoute } from './users';
import { tasksRoute } from './tasks';
import { profileRoute } from './profile';
import { registryRouter } from './registry';
import { sessionRoute } from './session';
import { activityRoute } from './activity';
import { feedbackRoute } from './feedback';
import { ILogger } from '../logger';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const router = new Router();

  router.use(errorHandlerMiddleware(logger));

  applyRouter(router, authRoute());
  applyRouter(router, sessionRoute(logger));
  applyRouter(router, publicMeRouter(logger));
  applyRouter(router, registryRouter(logger));
  applyRouter(router, courseRoute(logger));
  applyRouter(router, coursesRoute(logger));
  applyRouter(router, usersRoute(logger));
  applyRouter(router, tasksRoute(logger));
  applyRouter(router, profileRoute(logger));
  applyRouter(router, activityRoute(logger));
  applyRouter(router, feedbackRoute(logger));

  return { publicRouter: router };
};
