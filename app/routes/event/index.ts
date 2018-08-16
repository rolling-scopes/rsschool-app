import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute } from '../generic';
import { createPostEventsRoute, createDeleteEventsRoute, createPatchEventsRoute } from './Events';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, createPostEventsRoute);
    router.patch('/', adminGuard, createPatchEventsRoute);
    router.delete('/:id', adminGuard, createDeleteEventsRoute);

    return router;
}
