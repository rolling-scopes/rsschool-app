import * as Router from 'koa-router';
import { ILogger } from '../logger';
import { authRoute, guard } from './auth';
import { courseRoute } from './course';
import { eventRoute } from './event';
import { healthRoute } from './health';
import { sessionRoute } from './session';

type RoutesMiddleware = (logger: ILogger) => Router;

function log(logger: ILogger, name: string) {
    return logger.child({ module: `route:${name}` });
}

function applyRoute(router: Router, routeFactory: (logger: ILogger) => Router, logger: ILogger) {
    const route = routeFactory(logger);
    router.use(route.routes());
    router.use(route.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = logger => {
    const router = new Router();

    router.use(healthRoute(log(logger, 'health')));
    applyRoute(router, authRoute, log(logger, 'auth'));
    applyRoute(router, sessionRoute, log(logger, 'session'));

    router.use(guard);

    // Requires authentication
    applyRoute(router, courseRoute, log(logger, 'course'));
    applyRoute(router, eventRoute, log(logger, 'event'));

    return router;
};
