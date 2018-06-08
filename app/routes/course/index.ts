import * as Router from 'koa-router';
import { CourseDocument } from '../../models';
import { createGetRoute, createPostRoute } from '../generic';

import { courseAssignMentorsRoute } from './assignMentors';
import { courseEnrollRoute } from './enroll';
import { courseEventsRoute } from './events';
import { courseImportMentorsRoute, courseImportStudentsRoute } from './import';

export function courseRouter() {
    const router = new Router({ prefix: '/course' });

    router.get('/:id', createGetRoute(CourseDocument, { useObjectId: false }));
    router.post('/', createPostRoute(CourseDocument));

    router.post('/:id/enroll', courseEnrollRoute);
    router.get('/:id/events', courseEventsRoute);
    router.post('/:id/mentors/assign', courseAssignMentorsRoute);
    router.post('/:id/import/mentors', courseImportMentorsRoute);
    router.post('/:id/import/studens', courseImportStudentsRoute);

    return router;
}
