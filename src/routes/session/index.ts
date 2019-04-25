import * as Router from 'koa-router';
import { OK, NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

const getSession = (_: ILogger) => async (ctx: Router.RouterContext) => {
  if (ctx.state == null || !ctx.state!.user.id) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }

  const id = ctx.state!.user.id;
  const user = await getRepository(User).findOne(id);
  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, ctx.state!.user);
};

export function sessionRoute(logger: ILogger) {
  const router = new Router({ prefix: '/session' });

  /**
   * @swagger
   *
   * /session:
   *   get:
   *      description: Gets current user session
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.get('/', getSession(logger));

  return router;
}
