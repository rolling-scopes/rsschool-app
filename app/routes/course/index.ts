import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { CourseDocument } from '../../models';
import { getRoute, postRoute } from '../generic';

export * from './import';
export * from './enroll';
export * from './events';
export * from './assignMentors';

export function courseRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.get('/:id', getRoute(CourseDocument, { useObjectId: false }, logger));
    router.post('/', postRoute(CourseDocument, logger));

    return router;
}
