import * as Router from 'koa-router';
import { createPostEventsRoute, createDeleteEventsRoute, createPatchEventsRoute, createGetEventsRoute } from './events';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetEventsRoute);
    router.post('/', adminGuard, createPostEventsRoute);
    router.patch('/:eventType', adminGuard, createPatchEventsRoute);
    router.delete('/:id/:eventType', adminGuard, createDeleteEventsRoute);

    return router;
}
