import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Course } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

const getCourses = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courses = await getRepository(Course).find({});
  setResponse(ctx, OK, courses);
};

export function coursesRoute(logger: ILogger) {
  const router = new Router({ prefix: '/courses' });

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
  router.get('/', getCourses(logger));

  return router;
}
