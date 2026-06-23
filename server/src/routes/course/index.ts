import Router from '@koa/router';
import { ILogger } from '../../logger';
import { basicAuthAws, courseGuard, courseSupervisorGuard, crossCheckGuard, guard } from '../guards';
import { getCourseEvents } from './events';
import { getMentorStudents } from './mentor';
import { getCourseTasksVerifications } from './taskVerifications';

import { validateGithubIdAndAccess } from '../validators';
import * as crossCheck from './crossCheck';
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
  router.post('/task/:courseTaskId/cross-check/distribution', crossCheckGuard, crossCheck.createDistribution(logger));
  router.post('/task/:courseTaskId/cross-check/completion', crossCheckGuard, crossCheck.createCompletion(logger));
}

function addMentorApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];

  const mentorLogger = logger.child({ module: 'course/mentor' });
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(mentorLogger));
}

function addStudentApi(router: Router<any, any>, logger: ILogger) {
  router.get('/student/:githubId', courseSupervisorGuard, getStudent(logger));
}
