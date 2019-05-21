import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';

export function stageClose(logger: ILogger) {
    const router = new Router({ prefix: '/stage' });

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
    router.get('/', adminGuard, closeStage(logger));

    return router;
  }
