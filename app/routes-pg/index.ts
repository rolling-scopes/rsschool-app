import * as Router from 'koa-router';
import { userRouter } from './user';
import { feedbackRouter } from './feedback';
import { courseRouter } from './course';
import { ILogger } from '../logger';
import { config } from '../config';
const auth = require('koa-basic-auth'); //tslint:disable-line

type RoutesMiddleware = (logger: ILogger) => Router;

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

export const pgRoutesMiddleware: RoutesMiddleware = () => {
    const router = new Router();

    router.use(auth({ name: config.admin.username, pass: config.admin.password }));
    applyRouter(router, userRouter());
    applyRouter(router, feedbackRouter());
    applyRouter(router, courseRouter());
    return router;
};
