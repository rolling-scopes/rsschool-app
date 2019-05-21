import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';
import { shuffleMentors } from './stage';

export function stageClose(logger: ILogger) {
    const router = new Router({ prefix: '/stage' });

    /**
     * @swagger
     *
     * /stage/:stageId/close:
     *   get:
     *      description: close stage and shuffle mentors
     *      security:
     *        - cookieAuth: []
     *      produces:
     *        - application/json
     *      responses:
     *        200:
     *          description: profile
     */
    router.get('/:stageId/close', adminGuard, shuffleMentors(logger));

    return router;
  }
