import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute, createPostRoute } from '../generic';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', adminGuard, createPostRoute(EventModel));

    return router;
}
