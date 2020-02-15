import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Event } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

const getEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courses = await getRepository(Event).find({});
  setResponse(ctx, OK, courses);
};

export function lecturesRoute(logger: ILogger) {
  const router = new Router({ prefix: '/events' });

  /**
   * @swagger
   *
   * /lectures:
   *   get:
   *      description: Gets lectures info
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Lectures
   */
  router.get('/', getEvents(logger));

  return router;
}
