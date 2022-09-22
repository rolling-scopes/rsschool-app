import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Course } from '../../models';
import { createPostRoute } from '../common';
import {
  adminGuard,
  anyCourseMentorGuard,
  basicAuthAws,
  courseGuard,
  courseInterviewGuard,
  courseManagerGuard,
  courseMentorGuard,
  courseSupervisorGuard,
  courseSupervisorOrMentorGuard,
  crossCheckGuard,
  guard,
  taskOwnerGuard,
} from '../guards';
import { postCertificates, postStudentCertificate } from './certificates';
import { getCourseEvent, getCourseEvents } from './events';
import {
  deleteMentor as postMentorStatusExpelled,
  getAllMentorStudents,
  getMentorInterview,
  getMentorStudents,
  postMentor,
  restoreExpelledMentor,
} from './mentor';
import * as mentors from './mentors';
import * as score from './score';
import * as stageInterview from './stageInterview';
import {
  getStudents,
  getStudentsCsv,
  getStudentsWithDetails,
  postStudents,
  searchStudent,
  updateStatuses,
} from './students';
import { postTaskArtefact } from './taskArtefact';
import { createTaskVerification } from './taskVerification';
import { getCourseTasksVerifications, getStudentTaskVerifications } from './taskVerifications';

import * as interviews from './interviews';

import { validateCrossCheckExpirationDate, validateGithubId, validateGithubIdAndAccess } from '../validators';
import * as crossCheck from './crossCheck';
import {
  createRepositories,
  createRepository,
  inviteAllMentorsToTeam,
  inviteMentorToTeam,
  updateRepositories,
} from './repository';
import { getScheduleAsCsv, setScheduleFromCsv } from './schedule';
import {
  createInterviewResult,
  getCrossMentors,
  getStudent,
  getStudentSummary,
  postFeedback,
  selfUpdateStudentStatus,
  updateMentoringAvailability,
  updateStudent,
  updateStudentStatus,
} from './student';
import * as tasks from './tasks';
import { postCopyCourse } from './template';
import { getUsers, putUser, putUsers } from './user';

export function courseRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course/:courseId' });

  router.post('/certificates', courseManagerGuard, postCertificates(logger));
  router.post('/repositories', courseManagerGuard, createRepositories(logger));
  router.put('/repositories', courseManagerGuard, updateRepositories(logger));
  router.post('/copy', adminGuard, postCopyCourse(logger));

  addScoreApi(router, logger);
  addStageInterviewApi(router, logger);
  addInterviewsApi(router, logger);
  addEventApi(router, logger);
  addTaskApi(router, logger);
  addMentorApi(router, logger);
  addStudentApi(router, logger);
  addStudentCrossCheckApi(router, logger);
  addCourseUserApi(router, logger);
  addScheduleApi(router, logger);
  return router;
}

function addScoreApi(router: Router<any, any>, logger: ILogger) {
  router.post('/scores/calculation', adminGuard, score.recalculateScore(logger));
  router.post('/scores/:courseTaskId', taskOwnerGuard, score.createMultipleScores(logger));
}

function addInterviewsApi(router: Router<any, any>, logger: ILogger) {
  router.get('/interviews', courseGuard, interviews.getInterviews(logger));
  router.get('/interviews/:courseTaskId', courseManagerGuard, interviews.getInterviewPairs(logger));
  router.post(
    '/interview/:courseTaskId/interviewer/:githubId/student/:studentGithubId/',
    courseInterviewGuard,
    interviews.createInterview(logger),
  );
  router.post('/interviews/:courseTaskId', courseManagerGuard, interviews.createInterviews(logger));
  router.delete('/interviews/:courseTaskId/:id', courseManagerGuard, interviews.cancelInterview(logger));
}

function addEventApi(router: Router<any, any>, logger: ILogger) {
  router.get('/event/:id', courseGuard, getCourseEvent(logger));

  router.get('/events', courseGuard, getCourseEvents(logger));
}

function addTaskApi(router: Router<any, any>, logger: ILogger) {
  router.get('/tasks/details', courseGuard, tasks.getCourseTasksDetails(logger));

  router.get('/tasks/verifications', basicAuthAws, getCourseTasksVerifications(logger));
  router.post('/task/:courseTaskId/distribution', courseManagerGuard, tasks.createCourseTaskDistribution(logger));
  router.post('/task/:courseTaskId/artefact', courseGuard, postTaskArtefact(logger));
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

  router.get('/interview/stage/:interviewId/feedback', courseMentorGuard, stageInterview.getFeedback(logger));
  router.post('/interview/stage/:interviewId/feedback', courseMentorGuard, stageInterview.createFeedback(logger));

  router.put('/interview/stage/:interviewId', courseMentorGuard, stageInterview.updateInterview(logger));
  router.delete('/interview/stage/:interviewId', courseMentorGuard, stageInterview.cancelInterview(logger));

  router.post('/interviews/stage', courseManagerGuard, stageInterview.createInterviews(logger));
  router.get('/interviews/stage', courseMentorGuard, stageInterview.getInterviews(logger));
}

function addCourseUserApi(router: Router<any, any>, logger: ILogger) {
  router.get('/users', courseManagerGuard, getUsers(logger));
  router.put('/users', courseManagerGuard, putUsers(logger));
  router.put('/user/:githubId', courseManagerGuard, validateGithubId, putUser(logger));
}

function addMentorApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];

  const mentorsLogger = logger.child({ module: 'course/mentors' });
  router.get('/mentors', courseSupervisorGuard, mentors.getMentors(mentorsLogger));
  router.post('/mentors', adminGuard, mentors.createMentors(mentorsLogger));
  router.post('/mentors/students', courseSupervisorGuard, mentors.assignStudents(mentorsLogger));
  router.get('/mentors/details', courseSupervisorGuard, mentors.getMentorsDetails(mentorsLogger));
  router.get('/mentors/details/csv', courseSupervisorGuard, mentors.getMentorsDetailsCsv(mentorsLogger));
  router.get('/mentors/search/:searchText', courseGuard, mentors.searchMentors(mentorsLogger));

  const mentorLogger = logger.child({ module: 'course/mentor' });
  router.post('/mentor/:githubId', guard, ...validators, postMentor(mentorLogger));
  router.post('/repositories/mentor/:githubId', courseManagerGuard, ...validators, inviteMentorToTeam(mentorLogger));
  router.post('/repositories/mentors', courseManagerGuard, inviteAllMentorsToTeam(mentorLogger));
  router.get('/mentor/:githubId/students', guard, ...validators, getMentorStudents(mentorLogger));
  router.get('/mentor/:githubId/interview/:courseTaskId', guard, ...validators, getMentorInterview(mentorLogger));
  router.get('/mentor/:githubId/interviews', guard, ...validators, interviews.getMentorInterviews(mentorLogger));
  router.get('/mentor/:githubId/students/all', guard, ...validators, getAllMentorStudents(mentorLogger));
  router.post(
    '/mentor/:githubId/status/expelled',
    courseManagerGuard,
    validateGithubId,
    postMentorStatusExpelled(mentorLogger),
  );
  router.post(
    '/mentor/:githubId/status/restore',
    courseManagerGuard,
    validateGithubId,
    restoreExpelledMentor(mentorLogger),
  );
}

function addStudentApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const mentorValidators = [courseMentorGuard, validateGithubId];

  router.get('/student/:githubId', courseSupervisorGuard, getStudent(logger));
  router.put('/student/:githubId', courseSupervisorOrMentorGuard, updateStudent(logger));

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
  router.post('/student/:githubId/availability', courseManagerGuard, updateMentoringAvailability(logger));
  router.get('/student/:githubId/tasks/cross-mentors', courseGuard, ...validators, getCrossMentors(logger));
  router.get('/student/:githubId/tasks/verifications', courseGuard, ...validators, getStudentTaskVerifications(logger));
  router.get('/student/:githubId/interviews', courseGuard, ...validators, interviews.getStudentInterviews(logger));
  router.post('/student/:githubId/task/:courseTaskId/result', courseGuard, score.createSingleScore(logger));
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
  router.get('/student/:githubId/score', courseGuard, score.getScoreByStudent(logger));
  router.post('/student/:githubId/certificate', courseManagerGuard, validateGithubId, postStudentCertificate(logger));
  router.post('/student/feedback', anyCourseMentorGuard, postFeedback(logger));

  router.get('/students', courseSupervisorGuard, getStudents(logger));
  router.get('/students/csv', courseSupervisorGuard, getStudentsCsv(logger));
  router.post('/students/status', courseManagerGuard, updateStatuses(logger));
  router.post('/students', adminGuard, postStudents(logger));
  router.get('/students/details', courseSupervisorGuard, getStudentsWithDetails(logger));
  router.get('/students/score/csv', courseSupervisorGuard, score.getScoreCsv(logger));

  router.get('/students/search/:searchText', guard, searchStudent(logger));
}

function addStudentCrossCheckApi(router: Router<any, any>, logger: ILogger) {
  const validators = [validateGithubIdAndAccess];
  const baseUrl = `/student/:githubId/task/:courseTaskId`;

  router.post(
    `${baseUrl}/cross-check/solution`,
    courseGuard,
    ...validators,
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
  router.get(`${baseUrl}/cross-check/feedback`, courseGuard, ...validators, crossCheck.getFeedback(logger));
  router.get(`${baseUrl}/cross-check/assignments`, courseGuard, ...validators, crossCheck.getAssignments(logger));
}

function addScheduleApi(router: Router<any, any>, logger: ILogger) {
  router.get('/schedule/csv/:timeZone', courseSupervisorGuard, getScheduleAsCsv(logger));
  router.post('/schedule/csv/:timeZone', courseSupervisorGuard, setScheduleFromCsv(logger));
}

export function courseCrudRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/course' });

  router.post('/', adminGuard, createPostRoute(Course, logger));

  return router;
}
