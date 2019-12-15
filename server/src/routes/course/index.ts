import { BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { Course, CourseTask, CourseEvent } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard, guard, courseGuard, courseMentorGuard, courseManagerGuard, taskOwnerGuard } from '../guards';
import { setResponse } from '../utils';
import { getExternalAccounts } from './externalAccounts';
import { postInterviewFeedback, postInterviewFeedbacks } from './interviewFeedback';
import { getMyMentors } from './me';
import {
  getAllMentorStudents,
  getMentorStudents,
  getMentorInterviews,
  deleteMentor as postMentorStatusExpelled,
} from './mentor';
import { getMentors, postMentors, getMentorsDetails } from './mentors';
import { postPairs } from './pairs';
import { getScore, getScoreAsCsv, postScore, postScores, postMultipleScores, getScoreByStudent } from './score';
import { getCourseStages, postCourseStages } from './stages';
import { postCertificates } from './certificates';
import { postStudentsFeedbacks } from './studentFeedback';
import { getStudents, postStudents, searchCourseStudent, getStudentsWithDetails } from './students';
import { postTaskArtefact } from './taskArtefact';
import { postTaskVerification } from './taskVerification';
import { getCourseEvents, getCourseEventsCalendar } from './events';
import { getTaskVerifications } from './taskVerifications';
import {
  getStageInterviews,
  postStageInterview,
  postStageInterviews,
  getStudentInterviews,
  getStageInterviewStudents,
  getAvailableStudentsForInterviews,
  postStageInterviewFeedback,
  getStageInterviewFeedback,
  deleteStageInterview,
} from './stageInterview';

import {
  getCourseTasks,
  getCourseTasksWithTaskCheckers,
  getCourseTasksForTaskOwner,
  postShuffleCourseTask,
} from './tasks';
import { postRepository, postRepositories } from './repository';
import { validateGithubIdAndAccess, validateGithubId } from '../validators';
import { postStudentStatus, getStudentSummary } from './student';
import {
  postTaskSolution,
  postTaskSolutionDistribution,
  getTaskSolutionAssignments,
  postTaskSolutionResult,
  getTaskSolutionResult,
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
  router.post('/pairs', adminGuard, postPairs(logger));
  router.post('/interviewFeedback', courseGuard, postInterviewFeedback(logger));
  router.post('/interviewFeedbacks', adminGuard, postInterviewFeedbacks(logger));
  router.post('/studentsFeedbacks', adminGuard, postStudentsFeedbacks(logger));
  router.post('/certificates', adminGuard, postCertificates(logger));
  router.post('/repositories', adminGuard, postRepositories(logger));

  addProfileApi(router, logger);
  addScoreApi(router, logger);
  addStageApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addStageInterviewApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addCourseUserApi(router, logger);

  return router;
}

function addProfileApi(router: Router, logger: ILogger) {
  router.get('/me/mentors', courseGuard, getMyMentors(logger));
}

function addScoreApi(router: Router, logger: ILogger) {
  router.post('/scores', adminGuard, postScores(logger));
  router.post('/scores/:courseTaskId', taskOwnerGuard, postMultipleScores(logger));
}

function addStageApi(router: Router, logger: ILogger) {
  router.get('/stages', guard, getCourseStages(logger));
  router.post('/stages', adminGuard, postCourseStages(logger));
}

function addEventApi(router: Router, logger: ILogger) {
  router.put('/event/:id', adminGuard, createPutRoute(CourseEvent, logger));
  router.post('/event', adminGuard, createPostRoute(CourseEvent, logger));
  router.delete('/event/:id', adminGuard, createDeleteRoute(CourseEvent, logger));

  router.get('/events', courseGuard, getCourseEvents(logger));
  router.get('/events/ical', courseGuard, getCourseEventsCalendar(logger));
}

function addTaskApi(router: Router, logger: ILogger) {
  router.post('/task', adminGuard, createPostRoute(CourseTask, logger));
  router.put('/task/:id', adminGuard, createPutRoute(CourseTask, logger));
  router.delete('/task/:id', adminGuard, createDeleteRoute(CourseTask, logger));
  router.get('/tasks', courseGuard, getCourseTasks(logger));
  router.get('/tasksTaskOwner', taskOwnerGuard, getCourseTasksForTaskOwner(logger));
  router.get('/tasksCheckers', courseGuard, getCourseTasksWithTaskCheckers(logger));
  router.post('/task/:courseTaskId/shuffle', adminGuard, postShuffleCourseTask(logger));
  router.post('/task/:courseTaskId/artefact', courseGuard, postTaskArtefact(logger));
  router.post(
    '/task/:courseTaskId/cross-check/distribution',
    adminGuard,

    postTaskSolutionDistribution(logger),
  );
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
  router.get('/mentors', courseManagerGuard, getMentors(logger));
  router.post('/mentors', adminGuard, postMentors(logger));
  router.get('/mentors/details', courseManagerGuard, getMentorsDetails(logger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(logger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, getMentorInterviews(logger));
  router.get('/mentor/:githubId/students/all', guard, ...validators, getAllMentorStudents(logger));
  router.post('/mentor/:githubId/status/expelled', adminGuard, ...validators, postMentorStatusExpelled(logger));
}

function addStudentApi(router: Router, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateGithubId];

  router.get('/student/:githubId/summary', courseGuard, ...validators, getStudentSummary(logger));
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
    '/student/:githubId/task/:courseTaskId/cross-check/solution',
    courseGuard,
    ...validators,
    postTaskSolution(logger),
  );
  router.post(
    '/student/:githubId/task/:courseTaskId/cross-check/result',
    courseGuard,

    validateGithubId,
    postTaskSolutionResult(logger),
  );
  router.get(
    '/student/:githubId/task/:courseTaskId/cross-check/result',
    courseGuard,

    validateGithubId,
    getTaskSolutionResult(logger),
  );
  router.get(
    '/student/:githubId/task/:courseTaskId/cross-check/assignments',
    courseGuard,
    ...validators,
    getTaskSolutionAssignments(logger),
  );
  router.post('/student/:githubId/repository', adminGuard, ...validators, postRepository(logger));
  router.post('/student/:githubId/status', ...mentorValidators, postStudentStatus(logger));
  router.get('/student/:githubId/score', courseGuard, getScoreByStudent(logger));

  router.get('/students', courseManagerGuard, getStudents(logger));
  router.post('/students', adminGuard, postStudents(logger));
  router.get('/students/details', courseManagerGuard, getStudentsWithDetails(logger));
  router.get('/students/score', courseGuard, getScore(logger));
  router.get('/students/score/csv', courseManagerGuard, getScoreAsCsv(logger));

  router.get('/students/search/:searchText', courseGuard, searchCourseStudent(logger));
}

export function courseCrudRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course' });

  router.post('/', adminGuard, createPostRoute(Course, logger));
  router.get('/:id', guard, validateId, createGetRoute(Course, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(Course, logger));

  return router;
}
