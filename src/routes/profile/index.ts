import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';
import { getProfile } from './user';

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

    return router;
  }
