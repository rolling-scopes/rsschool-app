import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { getProfileInfo } from './info';
import { getMyProfile, updateMyProfile } from './me';

export function profileRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/profile' });

  /**
   * @swagger
   *
   * /profile:
   *   get:
   *      description: get user profile
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: profile
   */
  router.get('/info', guard, getProfileInfo(logger));

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
   *      description: update current user profile
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: profile
   */
  router.post('/me', guard, updateMyProfile(logger));

  return router;
}
