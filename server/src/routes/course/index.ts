import { BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { Course, CourseTask, CourseEvent } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard, guard, courseGuard, courseMentorGuard, courseManagerGuard, taskOwnerGuard } from '../guards';
import { setResponse } from '../utils';
import { postExpulsion } from './expulsion';
import { getExternalAccounts } from './externalAccounts';
import { postInterviewFeedback, postInterviewFeedbacks } from './interviewFeedback';
import { getMe, getMyMentors } from './me';
import { getAllMentorStudents, getMentorStudents, getMentorInterviews, deleteMentor } from './mentor';
import { getMentors, postMentors } from './mentors';
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

const validateCourseId = async (ctx: Router.RouterContext, next: any) => {
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Course Id]');
    return;
  }
  ctx.params.courseId = courseId;
  await next();
};

const validateId = async (ctx: Router.RouterContext, next: any) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Course Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

export function courseRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course' });

  /**
   * @swagger
   *
   * /course/{courseId}/mentor/students:
   *   get:
   *      description: Returns mentors students results
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: User object
   */
  router.get('/:courseId/mentor/me/students', guard, validateCourseId, getMentorStudents(logger));

  router.get('/:courseId/mentor/me/interviews', guard, validateCourseId, getMentorInterviews(logger));

  router.get('/:courseId/mentor/me/students/all', guard, validateCourseId, getAllMentorStudents(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/students:
   *   get:
   *      description: Returns course students
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of students
   */
  router.get('/:courseId/students', courseManagerGuard, validateCourseId, getStudents(logger));

  router.get('/:courseId/students/details', courseManagerGuard, validateCourseId, getStudentsWithDetails(logger));

  router.get('/:courseId/students/search/:searchText', taskOwnerGuard, validateCourseId, searchCourseStudent(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/externalAccounts:
   *   get:
   *      description: Returns external accounts of students
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of students with external accounts
   */
  router.get('/:courseId/externalAccounts', adminGuard, validateCourseId, getExternalAccounts(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/students:
   *   post:
   *      description: Add/Update course students
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *        - name: students
   *          in: body
   *          schema:
   *            type: array
   *            items:
   *              type: object
   *              properties:
   *                githubId:
   *                  type: string
   *                isExpelled:
   *                  type: boolean
   *                expellingReason:
   *                  type: boolean
   *                readyFullTime:
   *                  type: boolean
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of students
   */
  router.post('/:courseId/students', adminGuard, validateCourseId, postStudents(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/mentors:
   *   get:
   *      description: Returns course mentors
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of mentors
   */
  router.get('/:courseId/mentors', courseManagerGuard, validateCourseId, getMentors(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/mentors:
   *   post:
   *      description: Save course mentors
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *        - name: mentors
   *          in: body
   *          schema:
   *            type: array
   *            items:
   *              type: object
   *              properties:
   *                githubId:
   *                  type: string
   *                maxStudentsLimit:
   *                  type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of mentors
   */
  router.post('/:courseId/mentors', adminGuard, validateCourseId, postMentors(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/pairs:
   *   post:
   *      description: Assign student to mentor
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *        - name: pairs
   *          in: body
   *          schema:
   *            type: array
   *            items:
   *              type: object
   *              properties:
   *                studentGithubId:
   *                  type: string
   *                mentorGithubId:
   *                  type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of pairs
   */
  router.post('/:courseId/pairs', adminGuard, validateCourseId, postPairs(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/tasks:
   *   get:
   *      description: Returns course tasks
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of tasks object
   */
  router.get('/:courseId/stages', guard, validateCourseId, getCourseStages(logger));

  router.post('/:courseId/stages', adminGuard, validateCourseId, postCourseStages(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/tasks:
   *   get:
   *      description: Returns course tasks
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of tasks object
   */
  router.get('/:courseId/tasks', guard, validateCourseId, getCourseTasks(logger));

  router.get('/:courseId/tasksTaskOwner', taskOwnerGuard, validateCourseId, getCourseTasksForTaskOwner(logger));

  router.get('/:courseId/tasksCheckers', courseGuard, validateCourseId, getCourseTasksWithTaskCheckers(logger));

  router.post(
    '/:courseId/student/me/task/:id/verification',
    courseGuard,
    validateCourseId,
    postTaskVerification(logger),
  );

  /**
   * @swagger
   *
   * /course/{courseId}/task:
   *   post:
   *      description: Assign task to course/stage
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Result
   */
  router.post('/:courseId/task', adminGuard, validateCourseId, createPostRoute(CourseTask, logger));

  /**
   * @swagger
   *
   * /course/{courseId}/task/{courseTaskId}:
   *   put:
   *      description: Update course task
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Result
   */
  router.put('/:courseId/task/:id', adminGuard, validateCourseId, createPutRoute(CourseTask, logger));

  /**
   * @swagger
   *
   * /course/{courseId}/task/{courseTaskId}:
   *   delete:
   *      description: Delete course task
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Result
   */
  router.delete('/:courseId/task/:id', adminGuard, validateCourseId, createDeleteRoute(CourseTask, logger));

  router.get('/:courseId/events', courseGuard, validateCourseId, getCourseEvents(logger));

  router.post('/:courseId/event', adminGuard, validateCourseId, createPostRoute(CourseEvent, logger));

  router.put('/:courseId/event/:id', adminGuard, validateCourseId, createPutRoute(CourseEvent, logger));

  router.delete('/:courseId/event/:id', adminGuard, validateCourseId, createDeleteRoute(CourseEvent, logger));

  router.get('/:courseId/events/ical', courseGuard, validateCourseId, getCourseEventsCalendar(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/task/{courseTaskId}/shuffle:
   *   post:
   *      description: Assign course task to checker
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *        - name: courseTaskId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Result
   */
  router.post('/:courseId/task/:courseTaskId/shuffle', adminGuard, validateCourseId, postShuffleCourseTask(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/scores:
   *   post:
   *      description: Save course task score
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *        - name: scores
   *          in: body
   *          schema:
   *            type: array
   *            items:
   *              type: object
   *              properties:
   *                studentGithubId:
   *                  type: string
   *                mentorGithubId:
   *                  type: string
   *                courseTaskId:
   *                  type: integer
   *                comment:
   *                  type: string
   *                githubPrUrl:
   *                  type: string
   *                score:
   *                  type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.post('/:courseId/scores', adminGuard, validateCourseId, postScores(logger));

  router.post('/:courseId/scores/:courseTaskId', taskOwnerGuard, validateCourseId, postMultipleScores(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/score:
   *   post:
   *      description: Save course task score
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.post('/:courseId/score', courseGuard, validateCourseId, postScore(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/score:
   *   get:
   *      description: Get course score data
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.get('/:courseId/score', courseGuard, validateCourseId, getScore(logger));

  router.get('/:courseId/score/csv', courseManagerGuard, validateCourseId, getScoreAsCsv(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/expulsion:
   *   post:
   *      description: Expel student from course by active mentor
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: integer
   *        - name: data
   *          in: body
   *          schema:
   *            type: object
   *            properties:
   *              studentId:
   *                type: string
   *              comment:
   *                  type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: result
   */
  router.post('/:courseId/expulsion', courseMentorGuard, validateCourseId, postExpulsion(logger));

  router.get('/:courseId/me', courseGuard, validateCourseId, getMe(logger));

  router.get('/:courseId/me/mentors', courseGuard, validateCourseId, getMyMentors(logger));

  router.post('/:courseId/taskArtefact', courseGuard, validateCourseId, postTaskArtefact(logger));

  // router.get('/:courseId/mentorContacts', guard, validateCourseId, getMentorContacts(logger));

  router.post('/:courseId/interviewFeedback', courseGuard, validateCourseId, postInterviewFeedback(logger));

  router.post('/:courseId/interviewFeedbacks', adminGuard, validateCourseId, postInterviewFeedbacks(logger));

  router.post('/:courseId/studentsFeedbacks', adminGuard, validateCourseId, postStudentsFeedbacks(logger));

  router.post('/:courseId/certificates', adminGuard, validateCourseId, postCertificates(logger));

  router.get('/:courseId/student/me/tasks/verifications', courseGuard, validateCourseId, getTaskVerifications(logger));

  /**
   * @swagger
   *
   * /course/{courseId}:
   *   get:
   *      description: Return info about course
   *      parameters:
   *        - name: courseId
   *          in: path
   *          required: true
   *          type: integer
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.get('/:id', guard, validateId, createGetRoute(Course, logger));

  /**
   * @swagger
   *
   * /course:
   *   post:
   *      description: Create course
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.post('/', adminGuard, createPostRoute(Course, logger));

  router.put('/:id', adminGuard, validateId, createPutRoute(Course, logger));

  router.post('/:courseId/stage/:id/interview', courseMentorGuard, postStageInterview(logger));
  router.delete('/:courseId/stage/:id/interview/:interviewId', courseMentorGuard, deleteStageInterview(logger));

  router.get('/:courseId/stage/:id/interviews', courseMentorGuard, getStageInterviews(logger));
  router.get(
    '/:courseId/stage/:id/interviews/available-students',
    courseMentorGuard,
    getAvailableStudentsForInterviews(logger),
  );

  router.post('/:courseId/stage/:id/interviews', adminGuard, postStageInterviews(logger));

  router.get(
    '/:courseId/stage/:id/interviews/student/:studentId',
    courseMentorGuard,
    getStageInterviewFeedback(logger),
  );

  router.post('/:courseId/stage/:id/interviews/feedback', courseMentorGuard, postStageInterviewFeedback(logger));
  router.get('/:courseId/stage/:id/interviews/students', courseMentorGuard, getStageInterviewStudents(logger));
  router.get('/:courseId/user/:githubId/interviews', guard, getStudentInterviews(logger));

  router.post('/:courseId/user/:githubId/repository', adminGuard, postRepository(logger));
  router.post('/:courseId/repositories', adminGuard, postRepositories(logger));

  router.delete('/:courseId/mentor/:githubId', adminGuard, deleteMentor(logger));

  return router;
}
