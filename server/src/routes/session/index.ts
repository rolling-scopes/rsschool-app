import Router from '@koa/router';
import { OK, UNAUTHORIZED } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';

const getSession = (_: ILogger) => async (ctx: Router.RouterContext) => {
  if (ctx.state == null || ctx.state.user == null || ctx.state.user.id == null) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }

  setResponse(ctx, OK, ctx.state.user);
};

export function sessionRoute(logger: ILogger) {
  const router = new Router({ prefix: '/session' });

  router.get('/', getSession(logger));

  return router;
}
