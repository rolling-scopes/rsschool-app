import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute, createPostRoute, createPatchRoute, createDeleteRoute } from '../generic';
import { eventNotificationPostMiddleware, eventNotificationRemoveMiddleware } from './middlewares';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, createPostRoute(EventModel), eventNotificationPostMiddleware);
    router.patch('/', adminGuard, createPatchRoute(EventModel));
    router.delete('/:id', adminGuard, createDeleteRoute(EventModel), eventNotificationRemoveMiddleware);

    return router;
}
