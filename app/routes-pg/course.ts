import * as Router from 'koa-router';
import { Course } from '../models-pg';
import { ILogger } from '../logger';

import { createGetRoute, createPostRoute } from './common';

export function publicCourseRouter(logger: ILogger) {
    const router = new Router({ prefix: '/v2/course' });
    router.get('/:id', createGetRoute(Course, logger));
    return router;
}

export function adminCourseRouter(logger: ILogger) {
    const router = new Router({ prefix: '/v2/course' });
    router.post('/', createPostRoute(Course, logger));
    return router;
}
