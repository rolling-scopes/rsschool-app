import * as Router from 'koa-router';
import { adminUserRouter } from './user';
import { feedbackRouter } from './feedback';
import { publicMeRouter } from './me';
import { adminStudentRouter } from './student';
import { adminStudentsRouter } from './students';
import { adminMentorsRouter } from './mentors';
import { adminPairsRouter } from './pairs';
import { publicCourseRouter, adminCourseRouter } from './course';

import { ILogger } from '../logger';
import { config } from '../config';
const auth = require('koa-basic-auth'); //tslint:disable-line

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router; adminRouter: Router };

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
  const adminRouter = new Router();
  adminRouter.use(auth({ name: config.admin.username, pass: config.admin.password }));
  applyRouter(adminRouter, adminUserRouter(logger));
  applyRouter(adminRouter, feedbackRouter(logger));
  applyRouter(adminRouter, adminCourseRouter(logger));
  applyRouter(adminRouter, adminStudentRouter(logger));
  applyRouter(adminRouter, adminStudentsRouter(logger));
  applyRouter(adminRouter, adminMentorsRouter(logger));
  applyRouter(adminRouter, adminPairsRouter(logger));

  const publicRouter = new Router();
  applyRouter(publicRouter, publicCourseRouter(logger));
  applyRouter(publicRouter, publicMeRouter(logger));
  return { publicRouter, adminRouter };
};
