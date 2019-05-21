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
import { sessionRoute } from './session';
import { ILogger } from '../logger';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const publicRouter = new Router();

  publicRouter.use(errorHandlerMiddleware(logger));

  applyRouter(publicRouter, authRoute());
  applyRouter(publicRouter, sessionRoute(logger));
  applyRouter(publicRouter, publicMeRouter(logger));
  applyRouter(publicRouter, courseRoute(logger));
  applyRouter(publicRouter, coursesRoute(logger));
  applyRouter(publicRouter, usersRoute(logger));
  applyRouter(publicRouter, tasksRoute(logger));
  applyRouter(publicRouter, profileRoute(logger));

  return { publicRouter };
};
