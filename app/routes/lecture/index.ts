import * as Router from 'koa-router';
import { LectureModel } from '../../models/event';
import { createGetRoute, createPostRoute, createPatchRoute, createDeleteRoute } from '../generic';

export function eventRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/lecture' });

    router.get('/:id', createGetRoute(LectureModel));
    router.post('/', adminGuard, createPostRoute(LectureModel));
    router.patch('/', adminGuard, createPatchRoute(LectureModel));
    router.delete('/:id', adminGuard, createDeleteRoute(LectureModel));
    return router;
}
