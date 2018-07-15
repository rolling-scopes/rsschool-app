import * as Router from 'koa-router';
import { StageModel } from '../../models/stage';
import { createGetRoute, createPostRoute } from '../generic';
import { patchStageRoute, deleteStageRoute } from './stage';

export function stageRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/stage' });

    router.get('/:id', createGetRoute(StageModel));
    router.post('/', adminGuard, createPostRoute(StageModel));
    router.patch('/', adminGuard, patchStageRoute);
    router.delete('/:id', adminGuard, deleteStageRoute);

    return router;
}
