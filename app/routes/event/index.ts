import * as Router from 'koa-router';
import { EventModel } from '../../models/event';
import { createGetRoute, createPostRoute } from '../generic';

export function eventRouter() {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventModel));
    router.post('/', createPostRoute(EventModel));

    return router;
}
