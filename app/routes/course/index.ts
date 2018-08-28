import * as Router from 'koa-router';
import { CourseModel } from '../../models';
import { createGetRoute, createPostRoute } from '../generic';

import { courseAssignMentorsRoute } from './assignMentors';
import { courseEnrollRoute } from './enroll';
import { courseEventsRoute } from './events';
import { courseStagesRoute } from './stages';
import { courseStudentsRoute } from './students';
import { courseImportMentorsRoute, courseImportStudentsRoute } from './import';
import { courseMentorsRoute, courseMentorStudentsRoute } from './mentors';
import { updateCourseStudentRoute } from './student';

export function courseRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/course' });

    router.get('/:id', createGetRoute(CourseModel, { useObjectId: false }));
    router.post('/', createPostRoute(CourseModel));

    router.post('/:id/enroll', courseEnrollRoute);
    router.get('/:id/events', courseEventsRoute);
    router.get('/:id/stages', courseStagesRoute);

    router.patch('/:id/student', adminGuard, updateCourseStudentRoute);
    router.get('/:id/students', adminGuard, courseStudentsRoute);
    router.get('/:id/mentor-students', adminGuard, courseMentorStudentsRoute);
    router.get('/:id/mentors', adminGuard, courseMentorsRoute);
    router.post('/:id/mentors/assign', adminGuard, courseAssignMentorsRoute);
    router.post('/:id/import/mentors', adminGuard, courseImportMentorsRoute);
    router.post('/:id/import/students', adminGuard, courseImportStudentsRoute);

    return router;
}
