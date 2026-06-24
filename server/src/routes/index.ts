import Router from '@koa/router';

import { courseRoute } from './course';
import { errorHandlerMiddleware } from './logging';
import { taskRoute } from './task';

import { ILogger } from '../logger';
import { courseMiddleware, userRolesMiddleware } from './middlewares';

export * from './logging';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const router = new Router<any, any>();

  router.use(errorHandlerMiddleware(logger));
  router.use(userRolesMiddleware, courseMiddleware);

  // public routes

  applyRouter(router, courseRoute(logger));
  applyRouter(router, taskRoute(logger));

  return { publicRouter: router };
};
