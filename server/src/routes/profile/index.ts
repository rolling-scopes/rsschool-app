import Router from 'koa-router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { getProfile } from './user';
import { getMyProfile, updateMyProfile } from './me';

export function profileRoute(logger: ILogger) {
  const router = new Router({ prefix: '/profile' });

  /**
   * @swagger
   *
   * /profile:
   *   get:
   *      description: get student profile
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: profile
   */
  router.get('/', guard, getProfile(logger));

  /**
   * @swagger
   *
   * /profile/me:
   *   get:
   *      description: get current user profile
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: profile
   */
  router.get('/me', guard, getMyProfile(logger));

  /**
   * @swagger
   *
   * /profile/me:
   *   get:
   *      description: get current user profile
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: profile
   */
  router.post('/me', guard, updateMyProfile(logger));

  router.post('/registry', guard, updateMyProfile(logger));

  return router;
}
