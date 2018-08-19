import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute, createPostRoute, createPatchRoute, createDeleteRoute } from '../generic';
import { notificationPostMiddleware, notificationPatchMiddleware, notificationRemoveMiddleware } from './middlewares';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, createPostRoute(EventModel), notificationPostMiddleware);
    router.patch('/', adminGuard, createPatchRoute(EventModel), notificationPatchMiddleware);
    router.delete('/:id', adminGuard, createDeleteRoute(EventModel), notificationRemoveMiddleware);

    return router;
}
