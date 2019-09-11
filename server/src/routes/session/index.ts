import Router from 'koa-router';
import { OK, NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User, IUserSession } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

const getSession = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  if (ctx.state == null || ctx.state.user == null || ctx.state.user.id == null) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }

  const id = ctx.state.user.id;
  const user = await getRepository(User).findOne(id);
  if (user == null) {
    logger.warn(`Cannot find user with id = [${id}]`);
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, ctx.state.user);
};

const getGraphQlSession = (_: ILogger) => async (ctx: Router.RouterContext) => {
  if (ctx.state == null || ctx.state.user == null || ctx.state.user.id == null) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }
  const user = ctx.state.user as IUserSession;
  ctx.status = OK;
  ctx.body = {
    'X-Hasura-User-Id': user.id.toString(),
    'X-Hasura-Role': 'test',
    'X-Hasura-Is-Owner': 'false',
  };
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
  router.get('/graphql', getGraphQlSession(logger));

  return router;
}
