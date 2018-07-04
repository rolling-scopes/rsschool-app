import * as Router from 'koa-router';
import { ILogger } from '../logger';

import { guard, adminGuard } from './guards';

import { authRoute } from './auth';
import { courseRouter } from './course';
import { coursesRouter } from './courses';
import { eventRouter } from './event';
import { healthRouter } from './health';
import { sessionRouter } from './session';
import { userRouter } from './user';

type RoutesMiddleware = (logger: ILogger) => Router;

function applyRouter(topRouter: Router, router: Router) {
    topRouter.use(router.routes());
    topRouter.use(router.allowedMethods());
}

export const routeLoggerMiddleware: Router.IMiddleware = async (ctx: Router.IRouterContext, next: any) => {
    const oldLogger = ctx.logger;
    const userId = ctx.state && ctx.state.user ? ctx.state.user._id : undefined;
    ctx.logger = ctx.logger.child({ module: 'route', userId });
    await next();
    ctx.logger = oldLogger;
};

export const routesMiddleware: RoutesMiddleware = () => {
    const router = new Router();

    applyRouter(router, healthRouter());
    applyRouter(router, authRoute());
    applyRouter(router, sessionRouter());

    router.use(guard);

    // Requires authentication
    applyRouter(router, userRouter());
    applyRouter(router, courseRouter(adminGuard));
    applyRouter(router, coursesRouter());
    applyRouter(router, eventRouter());

    return router;
};
