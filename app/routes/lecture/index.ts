import * as Router from 'koa-router';
import { SessionModel } from '../../models/event';
import { createGetRoute, createPostRoute, createPatchRoute, createDeleteRoute } from '../generic';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/lecture' });

    router.get('/:id', createGetRoute(SessionModel));
    router.post('/', adminGuard, createPostRoute(SessionModel));
    router.patch('/', adminGuard, createPatchRoute(SessionModel));
    router.delete('/:id', adminGuard, createDeleteRoute(SessionModel));

    return router;
}
