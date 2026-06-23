import Router from '@koa/router';
import { ILogger } from '../../logger';
import { basicAuthAws, courseGuard, courseSupervisorGuard, crossCheckGuard, guard } from '../guards';
import { getCourseEvents } from './events';
import { getMentorStudents } from './mentor';
import { getCourseTasksVerifications } from './taskVerifications';

import {
  validateCrossCheckExpirationDate,
  validateExpelledStudent,
  validateGithubId,
  validateGithubIdAndAccess,
} from '../validators';
import * as crossCheck from './crossCheck';
import { getScheduleAsCsv, setScheduleFromCsv } from './schedule';
import { getStudent } from './student';

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  addEventApi(router, logger);
  addTaskApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addStudentCrossCheckApi(router, logger);
  addScheduleApi(router, logger);
  return router;
}

function addEventApi(router: Router<any, any>, logger: ILogger) {
  router.get('/events', courseGuard, getCourseEvents(logger));
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
  router.post('/task/:courseTaskId/cross-check/distribution', crossCheckGuard, crossCheck.createDistribution(logger));
  router.get(`/task/:courseTaskId/cross-check/details`, courseGuard, crossCheck.getTaskDetails(logger));
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

function addStudentCrossCheckApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const activeStudentValidators = [validateGithubIdAndAccess, validateExpelledStudent];
  const baseUrl = `/student/:githubId/task/:courseTaskId`;

  router.post(
    `${baseUrl}/cross-check/solution`,
    courseGuard,
    ...activeStudentValidators,
    validateCrossCheckExpirationDate,
    crossCheck.createSolution(logger),
  );
  router.delete(
    `${baseUrl}/cross-check/solution`,
    courseGuard,
    ...validators,
    validateCrossCheckExpirationDate,
    crossCheck.deleteSolution(logger),
  );
  router.get(`${baseUrl}/cross-check/solution`, courseGuard, validateGithubId, crossCheck.getSolution(logger));
  router.post(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, crossCheck.createResult(logger));
  router.get(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, crossCheck.getResult(logger));
  router.get(`${baseUrl}/cross-check/assignments`, courseGuard, ...validators, crossCheck.getAssignments(logger));
  router.post(
    `/taskSolutionResult/:taskSolutionResultId/task/:courseTaskId/cross-check/messages`,
    courseGuard,
    crossCheck.createMessage(logger),
  );
  router.put(
    `/taskSolutionResult/:taskSolutionResultId/task/:courseTaskId/cross-check/messages`,
    courseGuard,
    crossCheck.updateMessage(logger),
  );
}

function addScheduleApi(router: Router<any, any>, logger: ILogger) {
  router.get('/schedule/csv/:timeZone', courseSupervisorGuard, getScheduleAsCsv(logger));
  router.post('/schedule/csv/:timeZone', courseSupervisorGuard, setScheduleFromCsv(logger));
}
