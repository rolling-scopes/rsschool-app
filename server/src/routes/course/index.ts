import Router from '@koa/router';
import { ILogger } from '../../logger';
import {
  basicAuthAws,
  courseGuard,
  courseInterviewGuard,
  courseManagerGuard,
  courseMentorGuard,
  courseSupervisorGuard,
  courseSupervisorOrDementorGuard,
  crossCheckGuard,
  guard,
  taskOwnerGuard,
} from '../guards';
import { getCourseEvents } from './events';
import { getMentorInterview, getMentorStudents, postMentor } from './mentor';
import * as score from './score';
import * as stageInterview from './stageInterview';
import { getStudents, getStudentsCsv, getStudentsWithDetails, searchStudent } from './students';
import { getCourseTasksVerifications, getStudentTaskVerifications } from './taskVerifications';

import * as interviews from './interviews';

import {
  validateCrossCheckExpirationDate,
  validateExpelledStudent,
  validateGithubId,
  validateGithubIdAndAccess,
} from '../validators';
import * as crossCheck from './crossCheck';
import { getScheduleAsCsv, setScheduleFromCsv } from './schedule';
import { createInterviewResult, getCrossMentors, getStudent } from './student';
import * as tasks from './tasks';

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  addScoreApi(router, logger);
  addStageInterviewApi(router, logger);
  addInterviewsApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addStudentCrossCheckApi(router, logger);
  addScheduleApi(router, logger);
  return router;
}

function addScoreApi(router: Router<any, any>, logger: ILogger) {
  router.post('/scores/:courseTaskId', taskOwnerGuard, score.createMultipleScores(logger));
}

function addInterviewsApi(router: Router<any, any>, logger: ILogger) {
  router.post(
    '/interview/:courseTaskId/interviewer/:githubId/student/:studentGithubId/',
    courseInterviewGuard,
    interviews.createInterview(logger),
  );
  router.delete('/interviews/:courseTaskId/:id', courseManagerGuard, interviews.cancelInterview(logger));
}

function addEventApi(router: Router<any, any>, logger: ILogger) {
  router.get('/events', courseGuard, getCourseEvents(logger));
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
  router.post('/task/:courseTaskId/distribution', courseManagerGuard, tasks.createCourseTaskDistribution(logger));
  router.post('/task/:courseTaskId/cross-check/distribution', crossCheckGuard, crossCheck.createDistribution(logger));
  router.get(`/task/:courseTaskId/cross-check/details`, courseGuard, crossCheck.getTaskDetails(logger));
  router.post('/task/:courseTaskId/cross-check/completion', crossCheckGuard, crossCheck.createCompletion(logger));
}

function addStageInterviewApi(router: Router<any, any>, logger: ILogger) {
  router.post(
    '/interview/stage/interviewer/:githubId/student/:studentGithubId/',
    courseMentorGuard,
    stageInterview.createInterview(logger),
  );
  router.get(
    '/interview/stage/interviewer/:githubId/students',
    courseMentorGuard,
    stageInterview.getInterviewerStudents(logger),
  );

  /**
   * @deprecated. should be removed after feedbacks are migrated to new template
   */

  router.put('/interview/stage/:interviewId', courseMentorGuard, stageInterview.updateInterview(logger));
  router.delete('/interview/stage/:interviewId', courseMentorGuard, stageInterview.cancelInterview(logger));

  router.post('/interviews/stage', courseManagerGuard, stageInterview.createInterviews(logger));
  router.get('/interviews/stage', courseMentorGuard, stageInterview.getInterviews(logger));
}

function addMentorApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];

  const mentorLogger = logger.child({ module: 'course/mentor' });
  router.post('/mentor/:githubId', guard, ...validators, postMentor(mentorLogger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(mentorLogger));
  router.get('/mentor/:githubId/interview/:courseTaskId', guard, ...validators, getMentorInterview(mentorLogger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, interviews.getMentorInterviews(mentorLogger));
}

function addStudentApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateGithubId];

  router.get('/student/:githubId', courseSupervisorGuard, getStudent(logger));

  router.get(
    '/student/:githubId/interview/stage',
    courseGuard,
    ...validators,
    stageInterview.getInterviewStudent(logger),
  );

  router.get(
    '/student/:githubId/interview/:courseTaskId',
    courseGuard,
    ...validators,
    interviews.getInterviewStudent(logger),
  );

  router.get('/student/:githubId/tasks/cross-mentors', courseGuard, ...validators, getCrossMentors(logger));
  router.get('/student/:githubId/tasks/verifications', courseGuard, ...validators, getStudentTaskVerifications(logger));
  router.get('/student/:githubId/interviews', courseGuard, ...validators, interviews.getStudentInterviews(logger));
  router.post('/student/:githubId/task/:courseTaskId/result', courseGuard, score.createSingleScore(logger));
  router.post('/student/:githubId/interview/:courseTaskId/result', ...mentorValidators, createInterviewResult(logger));

  router.get('/students', courseSupervisorGuard, getStudents(logger));
  router.get('/students/csv', courseSupervisorGuard, getStudentsCsv(logger));
  router.get('/students/details', courseSupervisorOrDementorGuard, getStudentsWithDetails(logger));
  router.get('/students/score/csv', courseSupervisorGuard, score.getScoreCsv(logger));

  router.get('/students/search/:searchText', guard, searchStudent(logger));
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
