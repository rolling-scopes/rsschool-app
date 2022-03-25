import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { getMyProfile } from './me';
import { getProfileInfo } from './info';

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

  return router;
}
