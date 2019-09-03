import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Stage } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

const getStages = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courses = await getRepository(Stage).find({});
  setResponse(ctx, OK, courses);
};

export function stagesRoute(logger: ILogger) {
  const router = new Router({ prefix: '/stages' });

  /**
   * @swagger
   *
   * /courses:
   *   get:
   *      description: Gets courses info
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Courses info
   */
  router.get('/', getStages(logger));

  return router;
}
