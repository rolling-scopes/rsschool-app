import * as Router from 'koa-router';
import { Course } from '../models-pg';
import { ILogger } from '../logger';

import { createGetRoute, createPostRoute } from './common';

export function courseRouter(logger: ILogger) {
    const router = new Router({ prefix: '/v2/course' });

    router.get('/:id', createGetRoute(Course, logger));
    router.post('/', createPostRoute(Course, logger));

    return router;
}
