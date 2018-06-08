import * as Router from 'koa-router';
import { EventDocument } from '../../models/event';
import { createGetRoute, createPostRoute } from '../generic';

export function eventRouter() {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute(EventDocument));
    router.post('/', createPostRoute(EventDocument));

    return router;
}
