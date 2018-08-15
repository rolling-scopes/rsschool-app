import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute, createPatchRoute, createDeleteRoute } from '../generic';
import { splitEventsRoute } from './splitEvents';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, splitEventsRoute);
    router.patch('/', adminGuard, createPatchRoute(EventModel));
    router.delete('/:id', adminGuard, createDeleteRoute(EventModel));

    return router;
}
