import * as Router from 'koa-router';
import { User } from '../models-pg';
import { ILogger } from '../logger';
import { createGetRoute, createPostRoute } from './common';

export function userRouter(logger: ILogger) {
    const router = new Router({ prefix: '/v2/user' });

    router.get('/:id', createGetRoute(User, logger));
    router.post('/', createPostRoute(User, logger));

    return router;
}
