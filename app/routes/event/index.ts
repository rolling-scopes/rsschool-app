import * as Router from 'koa-router';
import { createPostEventsRoute, createDeleteEventsRoute, createPatchEventsRoute, createGetEventsRoute } from './Events';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetEventsRoute);
    router.post('/', adminGuard, createPostEventsRoute);
    router.patch('/', adminGuard, createPatchEventsRoute);
    router.delete('/:id', adminGuard, createDeleteEventsRoute);

    return router;
}
