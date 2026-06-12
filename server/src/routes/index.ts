import Router from '@koa/router';

import { courseRoute } from './course';
import { feedbackRoute } from './feedback';
import { filesRoute } from './file';
import { errorHandlerMiddleware } from './logging';
import { publicMeRouter } from './me';
import { profileRoute } from './profile';
import { registryRouter } from './registry';
import { taskRoute } from './task';
import { tasksRoute } from './tasks';
import { taskVerification } from './taskVerification';
import { usersRoute } from './users';

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

  applyRouter(router, publicMeRouter(logger));
  applyRouter(router, registryRouter(logger));
  applyRouter(router, courseRoute(logger));
  applyRouter(router, usersRoute(logger));
  applyRouter(router, taskRoute(logger));
  applyRouter(router, tasksRoute(logger));
  applyRouter(router, taskVerification(logger));
  applyRouter(router, profileRoute(logger));
  applyRouter(router, feedbackRoute(logger));
  applyRouter(router, filesRoute(logger));

  return { publicRouter: router };
};
