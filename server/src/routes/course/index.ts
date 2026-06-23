import Router from '@koa/router';
import { ILogger } from '../../logger';
import { basicAuthAws, courseGuard, courseSupervisorGuard, guard } from '../guards';
import { getCourseEvents } from './events';
import { getMentorStudents } from './mentor';
import { getCourseTasksVerifications } from './taskVerifications';

import { validateGithubIdAndAccess } from '../validators';
import { getStudent } from './student';

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  addEventApi(router, logger);
  addTaskApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  return router;
}

function addEventApi(router: Router<any, any>, logger: ILogger) {
  router.get('/events', courseGuard, getCourseEvents(logger));
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
}

function addMentorApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];

  const mentorLogger = logger.child({ module: 'course/mentor' });
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(mentorLogger));
}

function addStudentApi(router: Router<any, any>, logger: ILogger) {
  router.get('/student/:githubId', courseSupervisorGuard, getStudent(logger));
}
