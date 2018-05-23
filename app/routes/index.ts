import * as Router from 'koa-router';
import { ILogger } from '../logger';
import { courseRoute } from './course';
import { eventRoute } from './event';
import { healthRoute } from './health';

type RoutesMiddleware = (logger: ILogger) => Router;

function log(logger: ILogger, name: string) {
    return logger.child({ module: `route:${name}` });
}

export const routesMiddleware: RoutesMiddleware = logger => {
    const router = new Router();

    /**
     * Base route, return a 404
     */
    // router.get('/', async ctx => (ctx.status = 404));
    router.use(healthRoute(log(logger, 'health')));

    const courseRouter = courseRoute(log(logger, 'course'));
    router.use(courseRouter.routes());
    router.use(courseRouter.allowedMethods());

    const eventRouter = eventRoute(log(logger, 'event'));
    router.use(eventRouter.routes());
    router.use(eventRouter.allowedMethods());

    return router;
};
