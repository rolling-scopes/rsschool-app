import * as Router from 'koa-router';
import { getMe } from './me';
import { getStudents, postStudents } from './students';
import { getMentors, postMentors } from './mentors';
import { getTasks } from './tasks';
import { postScore } from './score';
import { ILogger } from '../../logger';
import { createGetRoute, createPostRoute } from '../common';
import { Course } from '../../models';
import { adminGuard } from '../guards';

export function courseRoute(logger: ILogger) {
  const router = new Router({ prefix: '/course' });

  /**
   * @swagger
   *
   * /course/{courseId}/me:
   *   get:
   *      description: Returns users profile
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: User object
   */
  router.get('/:courseId/me', getMe(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of students
   */
  router.get('/:courseId/students', adminGuard, getStudents(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/students:
   *   get:
   *      description: Save course students
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of students
   */
  router.post('/:courseId/students', adminGuard, postStudents(logger));

  /**
   * @swagger
   *
   * /course/{courseId}/mentors:
   *   post:
   *      description: Saves course mentors
   *      security:
   *        - cookieAuth: []
   *      parameters:
   *        - name: courseId
   *          in: path
   *          description: Course Id
   *          required: true
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of mentors
   */
  router.get('/:courseId/mentors', adminGuard, postMentors(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of mentors
   */
  router.post('/:courseId/mentors', adminGuard, getMentors(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of tasks object
   */
  router.get('/:courseId/tasks', getTasks(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.post('/:courseId/score', postScore(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.get('/:courseId', createGetRoute(Course, logger));

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
