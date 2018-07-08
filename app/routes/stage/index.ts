import * as Router from 'koa-router';
import { StageModel } from '../../models/stage';
import { createGetRoute, createPostRoute } from '../generic';

export function stageRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/stage' });

    router.get('/:id', createGetRoute(StageModel));
    router.post('/', adminGuard, createPostRoute(StageModel));

    return router;
}
