import * as Router from 'koa-router';
import { getMentorStudents } from './mentor';
import { getStudents, postStudents } from './students';
import { getMentors, postMentors } from './mentors';
import { getTasks } from './tasks';
import { postScore, getScore } from './score';
import { postPairs } from './pairs';
import { ILogger } from '../../logger';
import { createGetRoute, createPostRoute } from '../common';
import { Course } from '../../models';
import { adminGuard, guard } from '../guards';

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: User object
   */
  router.get('/:courseId/mentor/students', guard, getMentorStudents(logger));

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
   *   post:
   *      description: Add/Update course students
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
  router.get('/:courseId/mentors', adminGuard, getMentors(logger));

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
  router.post('/:courseId/mentors', adminGuard, postMentors(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of pairs
   */
  router.post('/:courseId/pairs', adminGuard, postPairs(logger));

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
  router.get('/:courseId/tasks', guard, getTasks(logger));

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
  router.post('/:courseId/score', guard, postScore(logger));

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
   *          type: number
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: ''
   */
  router.get('/:courseId/score', guard, getScore(logger));

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
  router.get('/:courseId', guard, createGetRoute(Course, logger));

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
