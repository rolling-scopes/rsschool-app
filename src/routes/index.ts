export * from './logging';

import * as Router from 'koa-router';
import { publicMeRouter } from './me';
import { publicProfileMentorRouter } from './profile-mentor';
import { courseRoute } from './course';
import { authRoute } from './auth';

import { ILogger } from '../logger';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const pgRouteLoggerMiddleware: Router.IMiddleware = async (ctx: Router.RouterContext, next: any) => {
  const oldLogger = ctx.logger;
  ctx.logger = ctx.logger.child({ module: 'route-pg' });
  await next();
  ctx.logger = oldLogger;
};

export const pgRoutesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  // const adminRouter = new Router();
  // adminRouter.use(auth({ name: config.admin.username, pass: config.admin.password }));
  // applyRouter(adminRouter, adminUserRouter(logger));
  // applyRouter(adminRouter, feedbackRouter(logger));
  // // applyRouter(adminRouter, adminCourseRouter(logger));
  // applyRouter(adminRouter, adminStudentRouter(logger));
  // applyRouter(adminRouter, adminStudentsRouter(logger));
  // applyRouter(adminRouter, adminMentorsRouter(logger));
  // applyRouter(adminRouter, adminPairsRouter(logger));

  const publicRouter = new Router();
  applyRouter(publicRouter, authRoute());
  applyRouter(publicRouter, publicMeRouter(logger));
  applyRouter(publicRouter, publicProfileMentorRouter(logger));
  applyRouter(publicRouter, courseRoute(logger));

  return { publicRouter };
};
