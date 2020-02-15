import { BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Course, CourseTask, CourseEvent } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
import {
  adminGuard,
  guard,
  courseGuard,
  courseMentorGuard,
  courseSupervisorGuard,
  taskOwnerGuard,
  courseManagerGuard,
} from '../guards';
import { setResponse } from '../utils';
import { getExternalAccounts } from './externalAccounts';
import {
  getAllMentorStudents,
  getMentorStudents,
  getMentorInterviews,
  getMentorInterview,
  deleteMentor as postMentorStatusExpelled,
} from './mentor';
import { getMentors, postMentors, getMentorsDetails } from './mentors';
import { getScore, getScoreAsCsv, postScore, postMultipleScores, getScoreByStudent } from './score';
import { getCourseStages, postCourseStages } from './stages';
import { postCertificates, postStudentCertificate } from './certificates';
import { postStudentsFeedbacks } from './studentFeedback';
import { getStudents, postStudents, searchCourseStudent, getStudentsWithDetails, getStudentsCsv } from './students';
import { postTaskArtefact } from './taskArtefact';
import { postTaskVerification } from './taskVerification';
import { getCourseEvents, getCourseEventsCalendar } from './events';
import { getTaskVerifications } from './taskVerifications';
import {
  getStageInterviews,
  postStageInterview,
  postStageInterviews,
  getStageInterviewStudents,
  getAvailableStudentsForInterviews,
  postStageInterviewFeedback,
  getStageInterviewFeedback,
  deleteStageInterview,
} from './stageInterview';

import { getStudentInterviews } from './interviews';

import { getCourseTasksDetails, postCourseTaskDistribution, getCourseTasks } from './tasks';
import { postRepository, postRepositories } from './repository';
import { validateGithubIdAndAccess, validateGithubId } from '../validators';
import { postStudentStatus, getStudentSummary, postStudentInterviewResult, getCrossMentorsTasks } from './student';
import {
  postTaskSolution,
  postTaskSolutionDistribution,
  postTaskSolutionCompletion,
  getTaskSolutionAssignments,
  postTaskSolutionResult,
  getTaskSolutionResult,
  getTaskSolutionFeedback,
} from './taskSolution';
import { getUsers, postUser, putUser } from './user';

const validateId = async (ctx: Router.RouterContext, next: any) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

export function courseRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course/:courseId' });

  router.get('/externalAccounts', adminGuard, getExternalAccounts(logger));
  router.post('/studentsFeedbacks', adminGuard, postStudentsFeedbacks(logger));
  router.post('/certificates', adminGuard, postCertificates(logger));
  router.post('/repositories', adminGuard, postRepositories(logger));

  addScoreApi(router, logger);
  addStageApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addStageInterviewApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addStudentCrossCheckApi(router, logger);
  addCourseUserApi(router, logger);

  return router;
}

function addScoreApi(router: Router, logger: ILogger) {
  router.post('/scores/:courseTaskId', taskOwnerGuard, postMultipleScores(logger));
}

function addStageApi(router: Router, logger: ILogger) {
  router.get('/stages', guard, getCourseStages(logger));
  router.post('/stages', adminGuard, postCourseStages(logger));
}

function addEventApi(router: Router, logger: ILogger) {
  router.put('/event/:id', courseManagerGuard, createPutRoute(CourseEvent, logger));
  router.post('/event', courseManagerGuard, createPostRoute(CourseEvent, logger));
  router.delete('/event/:id', courseManagerGuard, createDeleteRoute(CourseEvent, logger));

  router.get('/events', courseGuard, getCourseEvents(logger));
  router.get('/events/ical', courseGuard, getCourseEventsCalendar(logger));
}

function addTaskApi(router: Router, logger: ILogger) {
  router.post('/task', courseMentorGuard, createPostRoute(CourseTask, logger));
  router.put('/task/:id', courseMentorGuard, createPutRoute(CourseTask, logger));
  router.delete('/task/:id', courseMentorGuard, createDeleteRoute(CourseTask, logger));

  router.get('/tasks', courseGuard, getCourseTasks(logger));
  router.get('/tasks/details', courseGuard, getCourseTasksDetails(logger));
  router.post('/task/:courseTaskId/distribution', courseMentorGuard, postCourseTaskDistribution(logger));
  router.post('/task/:courseTaskId/artefact', courseGuard, postTaskArtefact(logger));
  router.post('/task/:courseTaskId/cross-check/distribution', courseMentorGuard, postTaskSolutionDistribution(logger));
  router.post('/task/:courseTaskId/cross-check/completion', courseMentorGuard, postTaskSolutionCompletion(logger));
}

function addStageInterviewApi(router: Router, logger: ILogger) {
  router.get('/stage/:id/interviews/available-students', courseMentorGuard, getAvailableStudentsForInterviews(logger));
  router.get('/stage/:id/interviews/student/:studentId', courseMentorGuard, getStageInterviewFeedback(logger));
  router.get('/stage/:id/interviews/students', courseMentorGuard, getStageInterviewStudents(logger));
  router.post('/stage/:id/interview', courseMentorGuard, postStageInterview(logger));
  router.post('/stage/:id/interviews', adminGuard, postStageInterviews(logger));
  router.get('/stage/:id/interviews', courseMentorGuard, getStageInterviews(logger));
  router.delete('/stage/:id/interview/:interviewId', courseMentorGuard, deleteStageInterview(logger));
  router.post('/stage/:id/interviews/feedback', courseMentorGuard, postStageInterviewFeedback(logger));
}

function addCourseUserApi(router: Router, logger: ILogger) {
  router.get('/users', adminGuard, getUsers(logger));
  router.post('/user/:githubId', adminGuard, validateGithubId, postUser(logger));
  router.put('/user/:githubId', adminGuard, validateGithubId, putUser(logger));
}

function addMentorApi(router: Router, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  router.get('/mentors', courseSupervisorGuard, getMentors(logger));
  router.post('/mentors', adminGuard, postMentors(logger));
  router.get('/mentors/details', courseSupervisorGuard, getMentorsDetails(logger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(logger));
  router.get('/mentor/:githubId/interview/:courseTaskId', guard, ...validators, getMentorInterview(logger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, getMentorInterviews(logger));
  router.get('/mentor/:githubId/students/all', guard, ...validators, getAllMentorStudents(logger));
  router.post('/mentor/:githubId/status/expelled', courseMentorGuard, ...validators, postMentorStatusExpelled(logger));
}

function addStudentApi(router: Router, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateGithubId];

  router.get('/student/:githubId/summary', courseGuard, ...validators, getStudentSummary(logger));
  router.get('/student/:githubId/tasks/cross-mentors', courseGuard, ...validators, getCrossMentorsTasks(logger));
  router.get('/student/:githubId/tasks/verifications', courseGuard, ...validators, getTaskVerifications(logger));
  router.get('/student/:githubId/interviews', courseGuard, ...validators, getStudentInterviews(logger));
  router.post('/student/:githubId/task/:courseTaskId/result', courseGuard, postScore(logger));
  router.post(
    '/student/:githubId/task/:courseTaskId/verification',
    courseGuard,
    ...validators,
    postTaskVerification(logger),
  );
  router.post(
    '/student/:githubId/interview/:courseTaskId/result',
    ...mentorValidators,
    postStudentInterviewResult(logger),
  );

  router.post('/student/:githubId/repository', adminGuard, ...validators, postRepository(logger));
  router.post('/student/:githubId/status', ...mentorValidators, postStudentStatus(logger));
  router.get('/student/:githubId/score', courseGuard, getScoreByStudent(logger));
  router.post('/student/:githubId/certificate', courseManagerGuard, ...validators, postStudentCertificate(logger));

  router.get('/students', courseSupervisorGuard, getStudents(logger));
  router.get('/students/csv', courseSupervisorGuard, getStudentsCsv(logger));
  router.post('/students', adminGuard, postStudents(logger));
  router.get('/students/details', courseSupervisorGuard, getStudentsWithDetails(logger));
  router.get('/students/score', courseGuard, getScore(logger));
  router.get('/students/score/csv', courseSupervisorGuard, getScoreAsCsv(logger));

  router.get('/students/search/:searchText', courseGuard, searchCourseStudent(logger));
}

function addStudentCrossCheckApi(router: Router, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const baseUrl = `/student/:githubId/task/:courseTaskId`;

  router.post(`${baseUrl}/cross-check/solution`, courseGuard, ...validators, postTaskSolution(logger));
  router.post(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, postTaskSolutionResult(logger));
  router.get(`${baseUrl}/cross-check/result`, courseGuard, validateGithubId, getTaskSolutionResult(logger));
  router.get(`${baseUrl}/cross-check/feedback`, courseGuard, ...validators, getTaskSolutionFeedback(logger));
  router.get(`${baseUrl}/cross-check/assignments`, courseGuard, ...validators, getTaskSolutionAssignments(logger));
}

export function courseCrudRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course' });

  router.post('/', adminGuard, createPostRoute(Course, logger));
  router.get('/:id', guard, validateId, createGetRoute(Course, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(Course, logger));

  return router;
}
