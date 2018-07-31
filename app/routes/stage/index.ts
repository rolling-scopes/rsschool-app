import * as Router from 'koa-router';
import { StageModel } from '../../models/stage';
import { createGetRoute, createPostRoute, createPatchRoute, createDeleteRoute } from '../generic';

export function stageRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/stage' });

    router.get('/:id', createGetRoute(StageModel));
    router.post('/', adminGuard, createPostRoute(StageModel));
    router.patch('/', adminGuard, createPatchRoute(StageModel));
    router.delete('/:id', adminGuard, createDeleteRoute(StageModel));

    return router;
}
