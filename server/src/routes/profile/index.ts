import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { getMyProfile, updateMyProfile } from './me';

export function profileRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/profile' });

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
