import * as Router from 'koa-router';
import { BAD_REQUEST } from 'http-status-codes';
import { getMentorStudents } from './mentor';
import { getStudents, postStudents } from './students';
import { getMentors, postMentors } from './mentors';
import { getCourseTasks, postCourseTask, putCourseTask, postShuffleCourseTask, deleteCourseTask } from './tasks';
import { getCourseStages } from './stages';
import { postTaskArtefact } from './taskArtefact';
import { postExpulsion } from './expulsion';
import { postScore, getScore, postScores } from './score';
import { getMe } from './me';
import { postPairs } from './pairs';
import { postFeedback } from './feedback';
import { ILogger } from '../../logger';
import { createGetRoute, createPostRoute } from '../common';
import { Course } from '../../models';
import { adminGuard, guard } from '../guards';
import { setResponse } from '../utils';

const validateCourseId = async (ctx: Router.RouterContext, next: any) => {
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Course Id]');
    return;
  }
  ctx.params.courseId = courseId;
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
  router.get('/:courseId/mentor/students', guard, validateCourseId, getMentorStudents(logger));

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
  router.get('/:courseId/students', adminGuard, validateCourseId, getStudents(logger));

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
   *      description: Saves course mentors
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
  router.get('/:courseId/mentors', adminGuard, validateCourseId, getMentors(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/mentors:
   *   post:
   *      description: Returns course mentors
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
  router.post('/:courseId/task', adminGuard, validateCourseId, postCourseTask(logger));

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
  router.put('/:courseId/task/:courseTaskId', adminGuard, validateCourseId, putCourseTask(logger));

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
  router.delete('/:courseId/task/:courseTaskId', adminGuard, deleteCourseTask(logger));

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
  router.post('/:courseId/task/:courseTaskId/shuffle', validateCourseId, postShuffleCourseTask(logger));

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
  router.post('/:courseId/score', guard, validateCourseId, postScore(logger));

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
  router.get('/:courseId/score', guard, validateCourseId, getScore(logger));

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
  router.post('/:courseId/expulsion', guard, validateCourseId, postExpulsion(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/feedback:
   *   post:
   *      description: Post feedback about a mentor or student
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
   *              toUserId:
   *                type: integer
   *              text:
   *                type: string
   *              badgeId:
   *                type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: result
   */
  router.post('/:courseId/feedback', guard, validateCourseId, postFeedback(logger));

  router.get('/:courseId/me', guard, validateCourseId, getMe(logger));

  router.post('/:courseId/taskArtefact', guard, validateCourseId, postTaskArtefact(logger));

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
  router.get('/:id', guard, createGetRoute(Course, logger));

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

  return router;
}
