import * as Router from 'koa-router';
import { ILogger } from '../logger';
import { courseRoute } from './course';
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

    return router;
};
