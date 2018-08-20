import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createPostRoute } from './createPostRoute';
import { createGetRoute, createPatchRoute, createDeleteRoute } from '../generic';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, createPostRoute(EventModel));
    router.patch('/', adminGuard, createPatchRoute(EventModel));
    router.delete('/:id', adminGuard, createDeleteRoute(EventModel));

    return router;
}
