import { BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { Next } from 'koa';
import { ILogger } from '../../logger';
import { Course, CourseTask, CourseEvent } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute, createDisableRoute } from '../common';
import {
  adminGuard,
  guard,
  courseGuard,
  courseMentorGuard,
  courseSupervisorGuard,
  taskOwnerGuard,
  courseManagerGuard,
  basicAuthAws,
  anyCourseMentorGuard,
} from '../guards';
import { setResponse } from '../utils';
import {
  getAllMentorStudents,
  getMentorStudents,
  getMentorInterview,
  deleteMentor as postMentorStatusExpelled,
  postMentor,
} from './mentor';
import { getMentors, createMentors, getMentorsDetails, searchMentors } from './mentors';
import { getScore, getScoreAsCsv, postScore, postMultipleScores, getScoreByStudent } from './score';
import { getCourseStages, postCourseStages } from './stages';
import { postCertificates, postStudentCertificate } from './certificates';
import {
  getStudents,
  postStudents,
  searchStudent,
  getStudentsWithDetails,
  getStudentsCsv,
  updateStatuses,
} from './students';
import { postTaskArtefact } from './taskArtefact';
import { createTaskVerification } from './taskVerification';
import { getCourseEvents, getCourseEventsCalendar } from './events';
import { getStudentTaskVerifications, getCourseTasksVerifications } from './taskVerifications';
import * as stageInterview from './stageInterview';

import * as interviews from './interviews';

import { getCourseTasksDetails, createCourseTaskDistribution, getCourseTasks } from './tasks';
import {
  createRepository,
  createRepositories,
  updateRepositories,
  inviteMentorToTeam,
  inviteAllMentorsToTeam,
} from './repository';
import { validateGithubIdAndAccess, validateGithubId, validateCrossCheckExpirationDate } from '../validators';
import {
  updateStudentStatus,
  selfUpdateStudentStatus,
  getStudentSummary,
  createInterviewResult,
  getCrossMentors,
  getStudent,
  updateStudent,
  postFeedback,
} from './student';
import * as crossCheck from './crossCheck';
import { getUsers, postUser, putUser } from './user';
import { postCopyCourse } from './template';

const validateId = async (ctx: Router.RouterContext, next: Next) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  router.post('/certificates', courseManagerGuard, postCertificates(logger));
  router.post('/repositories', courseManagerGuard, createRepositories(logger));
  router.put('/repositories', courseManagerGuard, updateRepositories(logger));
  router.post('/copy', adminGuard, postCopyCourse(logger));

  addScoreApi(router, logger);
  addStageInterviewApi(router, logger);
  addInterviewsApi(router, logger);
  addStageApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addStudentCrossCheckApi(router, logger);
  addCourseUserApi(router, logger);

  return router;
}

function addScoreApi(router: Router<any, any>, logger: ILogger) {
  router.post('/scores/:courseTaskId', taskOwnerGuard, postMultipleScores(logger));
}

function addInterviewsApi(router: Router<any, any>, logger: ILogger) {
  router.get('/interviews', courseGuard, interviews.getInterviews(logger));
  router.post('/interviews/:courseTaskId', courseManagerGuard, interviews.createInterviews(logger));
}

function addStageApi(router: Router<any, any>, logger: ILogger) {
  router.get('/stages', guard, getCourseStages(logger));
  router.post('/stages', adminGuard, postCourseStages(logger));
}

function addEventApi(router: Router<any, any>, logger: ILogger) {
  router.put('/event/:id', courseManagerGuard, createPutRoute(CourseEvent, logger));
  router.post('/event', courseManagerGuard, createPostRoute(CourseEvent, logger));
  router.delete('/event/:id', courseManagerGuard, createDeleteRoute(CourseEvent, logger));

  router.get('/events', courseGuard, getCourseEvents(logger));
  router.get('/events/ical', courseGuard, getCourseEventsCalendar(logger));
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.post('/task', courseManagerGuard, createPostRoute(CourseTask, logger));
  router.put('/task/:id', courseManagerGuard, createPutRoute(CourseTask, logger));
  router.delete('/task/:id', courseManagerGuard, createDisableRoute(CourseTask, logger));

  router.get('/tasks', courseGuard, getCourseTasks(logger));
  router.get('/tasks/details', courseGuard, getCourseTasksDetails(logger));
  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
  router.post('/task/:courseTaskId/distribution', courseManagerGuard, createCourseTaskDistribution(logger));
  router.post('/task/:courseTaskId/artefact', courseGuard, postTaskArtefact(logger));
  router.post(
    '/task/:courseTaskId/cross-check/distribution',
    courseManagerGuard,
    crossCheck.createDistribution(logger),
  );
  router.post('/task/:courseTaskId/cross-check/completion', courseManagerGuard, crossCheck.createCompletion(logger));
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

  router.get('/interview/stage/:interviewId/feedback', courseMentorGuard, stageInterview.getFeedback(logger));
  router.post('/interview/stage/:interviewId/feedback', courseMentorGuard, stageInterview.createFeedback(logger));

  router.put('/interview/stage/:interviewId', courseMentorGuard, stageInterview.updateInterview(logger));
  router.delete('/interview/stage/:interviewId', courseMentorGuard, stageInterview.deleteInterview(logger));

  router.get('/interviews/stage/students/available', courseMentorGuard, stageInterview.getAvailableStudents(logger));
  router.post('/interviews/stage', courseManagerGuard, stageInterview.createInterviews(logger));
  router.get('/interviews/stage', courseMentorGuard, stageInterview.getInterviews(logger));
}

function addCourseUserApi(router: Router<any, any>, logger: ILogger) {
  router.get('/users', courseManagerGuard, getUsers(logger));
  router.post('/user/:githubId', courseManagerGuard, validateGithubId, postUser(logger));
  router.put('/user/:githubId', courseManagerGuard, validateGithubId, putUser(logger));
}

function addMentorApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  router.get('/mentors', courseSupervisorGuard, getMentors(logger));
  router.post('/mentors', adminGuard, createMentors(logger));
  router.get('/mentors/details', courseSupervisorGuard, getMentorsDetails(logger));
  router.get('/mentors/search/:searchText', courseGuard, searchMentors(logger));

  router.post('/mentor/:githubId', guard, ...validators, postMentor(logger));
  router.post('/repositories/mentor/:githubId', courseManagerGuard, ...validators, inviteMentorToTeam(logger));
  router.post('/repositories/mentors', courseManagerGuard, inviteAllMentorsToTeam(logger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(logger));
  router.get('/mentor/:githubId/interview/:courseTaskId', guard, ...validators, getMentorInterview(logger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, interviews.getMentorInterviews(logger));
  router.get('/mentor/:githubId/students/all', guard, ...validators, getAllMentorStudents(logger));
  router.post(
    '/mentor/:githubId/status/expelled',
    courseManagerGuard,
    validateGithubId,
    postMentorStatusExpelled(logger),
  );
}

function addStudentApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateGithubId];

  router.get('/student/:githubId', courseSupervisorGuard, getStudent(logger));
  router.put('/student/:githubId', courseSupervisorGuard, updateStudent(logger));

  router.get(
    '/student/:githubId/interview/stage',
    courseGuard,
    ...validators,
    stageInterview.getInterviewStudent(logger),
  );
  router.post(
    '/student/:githubId/interview/stage',
    courseGuard,
    ...validators,
    stageInterview.createInterviewStudent(logger),
  );

  router.get(
    '/student/:githubId/interview/:courseTaskId',
    courseGuard,
    ...validators,
    interviews.getInterviewStudent(logger),
  );

  router.post(
    '/student/:githubId/interview/:courseTaskId',
    courseGuard,
    ...validators,
    interviews.createInterviewStudent(logger),
  );

  router.get('/student/:githubId/summary', courseGuard, ...validators, getStudentSummary(logger));
  router.get('/student/:githubId/tasks/cross-mentors', courseGuard, ...validators, getCrossMentors(logger));
  router.get('/student/:githubId/tasks/verifications', courseGuard, ...validators, getStudentTaskVerifications(logger));
  router.get('/student/:githubId/interviews', courseGuard, ...validators, interviews.getStudentInterviews(logger));
  router.post('/student/:githubId/task/:courseTaskId/result', courseGuard, postScore(logger));
  router.post(
    '/student/:githubId/task/:courseTaskId/verification',
    courseGuard,
    ...validators,
    createTaskVerification(logger),
  );
  router.post('/student/:githubId/interview/:courseTaskId/result', ...mentorValidators, createInterviewResult(logger));

  router.post('/student/:githubId/repository', guard, ...validators, createRepository(logger));
  router.post('/student/:githubId/status', ...mentorValidators, updateStudentStatus(logger));
  router.post('/student/:githubId/status-self', courseGuard, selfUpdateStudentStatus(logger));
  router.get('/student/:githubId/score', courseGuard, getScoreByStudent(logger));
  router.post('/student/:githubId/certificate', courseManagerGuard, validateGithubId, postStudentCertificate(logger));
  router.post('/student/feedback', anyCourseMentorGuard, postFeedback(logger));

  router.get('/students', courseSupervisorGuard, getStudents(logger));
  router.get('/students/csv', courseSupervisorGuard, getStudentsCsv(logger));
  router.post('/students/status', courseManagerGuard, updateStatuses(logger));
  router.post('/students', adminGuard, postStudents(logger));
  router.get('/students/details', courseSupervisorGuard, getStudentsWithDetails(logger));
  router.get('/students/score', courseGuard, getScore(logger));
  router.get('/students/score/csv', courseSupervisorGuard, getScoreAsCsv(logger));

  router.get('/students/search/:searchText', courseGuard, searchStudent(logger));
}

function addStudentCrossCheckApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const baseUrl = `/student/:githubId/task/:courseTaskId`;

  router.post(
    `${baseUrl}/cross-check/solution`,
    courseGuard,
    validateGithubIdAndAccess,
    validateCrossCheckExpirationDate,
    crossCheck.createSolution(logger),
  );
  router.get(`${baseUrl}/cross-check/solution`, courseGuard, ...validators, crossCheck.getSolution(logger));
  router.post(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, crossCheck.createResult(logger));
  router.get(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, crossCheck.getResult(logger));
  router.get(`${baseUrl}/cross-check/feedback`, courseGuard, ...validators, crossCheck.getFeedback(logger));
  router.get(`${baseUrl}/cross-check/assignments`, courseGuard, ...validators, crossCheck.getAssignments(logger));
}

export function courseCrudRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course' });

  router.post('/', adminGuard, createPostRoute(Course, logger));
  router.get('/:id', guard, validateId, createGetRoute(Course, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(Course, logger));

  return router;
}
