import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { adminGuard, guard } from '../guards';
import { getProfile } from './user';
import { getMyProfile } from './me';

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
  router.get('/', adminGuard, getProfile(logger));

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
