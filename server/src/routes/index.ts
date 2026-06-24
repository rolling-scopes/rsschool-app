import Router from '@koa/router';

import { errorHandlerMiddleware } from './logging';

import { ILogger } from '../logger';
import { courseMiddleware, userRolesMiddleware } from './middlewares';

export * from './logging';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const router = new Router<any, any>();

  router.use(errorHandlerMiddleware(logger));
  router.use(userRolesMiddleware, courseMiddleware);

  // All HTTP endpoints have been migrated to NestJS (/api/v2/*). The Koa app no longer serves routes.

  return { publicRouter: router };
};
