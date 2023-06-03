import Router from '@koa/router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { User } from '../models';
import { ILogger } from '../logger';
import { setResponse } from './utils';

export function publicMeRouter(_: ILogger) {
  const router = new Router<any, any>({ prefix: '/v2/me' });

  /**
   * @swagger
   *
   * /v2/me:
   *   get:
   *     description: Returns users profile
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: User object
   */
  router.get('/', async (ctx: Router.RouterContext) => {
    const id = ctx.state!.user.id;
    if (!id) {
      setResponse(ctx, NOT_FOUND);
      return;
    }
    const user = await getRepository(User).findOneBy({ id });
    if (user === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }
    setResponse(ctx, OK, user);
  });

  return router;
}
