export * from './logging';

import * as Router from 'koa-router';
import { publicMeRouter } from './me';
import { courseRoute } from './course';
import { authRoute } from './auth';
import { usersRoute } from './users';
import { tasksRoute } from './tasks';

import { ILogger } from '../logger';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const publicRouter = new Router();

  applyRouter(publicRouter, authRoute());
  applyRouter(publicRouter, publicMeRouter(logger));
  applyRouter(publicRouter, courseRoute(logger));
  applyRouter(publicRouter, usersRoute(logger));
  applyRouter(publicRouter, tasksRoute(logger));

  return { publicRouter };
};
