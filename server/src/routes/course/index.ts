import { BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { Course, CourseTask, CourseEvent } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard, guard, courseGuard, courseMentorGuard, courseManagerGuard, taskOwnerGuard } from '../guards';
import { setResponse } from '../utils';
import { getExternalAccounts } from './externalAccounts';
import { postInterviewFeedback, postInterviewFeedbacks } from './interviewFeedback';
import { getMe, getMyMentors } from './me';
import {
  getAllMentorStudents,
  getMentorStudents,
  getMentorInterviews,
  deleteMentor as postMentorStatusExpelled,
} from './mentor';
import { getMentors, postMentors, getMentorsDetails } from './mentors';
import { postPairs } from './pairs';
import { getScore, getScoreAsCsv, postScore, postScores, postMultipleScores } from './score';
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
import { postStudentStatus } from './student';
import { postTaskSolution } from './taskSolution';

const validateCourseId = async (ctx: Router.RouterContext, next: any) => {
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Course Id]');
    return;
  }
  const courseTaskId = Number(ctx.params.courseTaskId);
  if (!isNaN(courseTaskId)) {
    ctx.params.courseTaskId = courseTaskId;
  }
  await next();
};

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

  router.get('/externalAccounts', adminGuard, validateCourseId, getExternalAccounts(logger));
  router.post('/pairs', adminGuard, validateCourseId, postPairs(logger));
  router.post('/interviewFeedback', courseGuard, validateCourseId, postInterviewFeedback(logger));
  router.post('/interviewFeedbacks', adminGuard, validateCourseId, postInterviewFeedbacks(logger));
  router.post('/studentsFeedbacks', adminGuard, validateCourseId, postStudentsFeedbacks(logger));
  router.post('/certificates', adminGuard, validateCourseId, postCertificates(logger));
  router.post('/repositories', adminGuard, postRepositories(logger));

  addProfileApi(router, logger);
  addScoreApi(router, logger);
  addStageApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addStageInterviewApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);

  return router;
}

function addProfileApi(router: Router, logger: ILogger) {
  router.get('/me', courseGuard, validateCourseId, getMe(logger));
  router.get('/me/mentors', courseGuard, validateCourseId, getMyMentors(logger));
}

function addScoreApi(router: Router, logger: ILogger) {
  router.post('/scores', adminGuard, validateCourseId, postScores(logger));
  router.post('/scores/:courseTaskId', taskOwnerGuard, validateCourseId, postMultipleScores(logger));
  router.post('/score', courseGuard, validateCourseId, postScore(logger));
}

function addStageApi(router: Router, logger: ILogger) {
  router.get('/stages', guard, validateCourseId, getCourseStages(logger));
  router.post('/stages', adminGuard, validateCourseId, postCourseStages(logger));
}

function addEventApi(router: Router, logger: ILogger) {
  router.put('/event/:id', adminGuard, validateCourseId, createPutRoute(CourseEvent, logger));
  router.post('/event', adminGuard, validateCourseId, createPostRoute(CourseEvent, logger));
  router.delete('/event/:id', adminGuard, validateCourseId, createDeleteRoute(CourseEvent, logger));

  router.get('/events', courseGuard, validateCourseId, getCourseEvents(logger));
  router.get('/events/ical', courseGuard, validateCourseId, getCourseEventsCalendar(logger));
}

function addTaskApi(router: Router, logger: ILogger) {
  router.post('/task', adminGuard, validateCourseId, createPostRoute(CourseTask, logger));
  router.put('/task/:id', adminGuard, validateCourseId, createPutRoute(CourseTask, logger));
  router.delete('/task/:id', adminGuard, validateCourseId, createDeleteRoute(CourseTask, logger));
  router.get('/tasks', courseGuard, validateCourseId, getCourseTasks(logger));
  router.get('/tasksTaskOwner', taskOwnerGuard, validateCourseId, getCourseTasksForTaskOwner(logger));
  router.get('/tasksCheckers', courseGuard, validateCourseId, getCourseTasksWithTaskCheckers(logger));
  router.post('/task/:courseTaskId/shuffle', adminGuard, validateCourseId, postShuffleCourseTask(logger));
  router.post('/taskArtefact', courseGuard, validateCourseId, postTaskArtefact(logger));
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

function addMentorApi(router: Router, logger: ILogger) {
  const validators = [validateCourseId, validateGithubIdAndAccess];
  router.get('/mentors', courseManagerGuard, validateCourseId, getMentors(logger));
  router.get('/mentors/details', courseManagerGuard, validateCourseId, getMentorsDetails(logger));

  router.post('/mentors', adminGuard, validateCourseId, postMentors(logger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(logger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, getMentorInterviews(logger));
  router.get('/mentor/:githubId/students/all', guard, ...validators, getAllMentorStudents(logger));
  router.post('/mentor/:githubId/status/expelled', adminGuard, ...validators, postMentorStatusExpelled(logger));
}

function addStudentApi(router: Router, logger: ILogger) {
  const validators = [validateCourseId, validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateCourseId, validateGithubId];

  router.get('/student/:githubId/tasks/verifications', courseGuard, ...validators, getTaskVerifications(logger));
  router.get('/student/:githubId/interviews', courseGuard, ...validators, getStudentInterviews(logger));
  router.post(
    '/student/:githubId/task/:courseTaskId/verification',
    courseGuard,
    ...validators,
    postTaskVerification(logger),
  );
  router.post('/student/:githubId/task/:courseTaskId/solution', courseGuard, ...validators, postTaskSolution(logger));
  router.post('/student/:githubId/repository', adminGuard, ...validators, postRepository(logger));
  router.post('/student/:githubId/status', ...mentorValidators, postStudentStatus(logger));

  router.get('/students', courseManagerGuard, validateCourseId, getStudents(logger));
  router.post('/students', adminGuard, validateCourseId, postStudents(logger));
  router.get('/students/details', courseManagerGuard, validateCourseId, getStudentsWithDetails(logger));
  router.get('/students/score', courseGuard, validateCourseId, getScore(logger));
  router.get('/students/score/csv', courseManagerGuard, validateCourseId, getScoreAsCsv(logger));

  router.get('/students/search/:searchText', courseManagerGuard, validateCourseId, searchCourseStudent(logger));
}

export function courseCrudRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course' });

  router.get('/:id', guard, validateId, createGetRoute(Course, logger));
  router.post('/', adminGuard, createPostRoute(Course, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(Course, logger));

  return router;
}
