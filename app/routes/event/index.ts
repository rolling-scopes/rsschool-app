import * as Router from 'koa-router';
import { createPostRoute, createGetRoute, createDeleteRoute, createPatchRoute } from './event';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/event' });

    router.get('/:id', createGetRoute);
    router.post('/', adminGuard, createPostRoute);
    router.patch('/', adminGuard, createPatchRoute);
    router.delete('/:id', adminGuard, createDeleteRoute);

    return router;
}
