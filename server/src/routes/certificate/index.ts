import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { guard } from '../guards';

export function certificateRoute(_: ILogger) {
  const router = new Router({ prefix: '/certificate' });

  router.get('/(.*)', guard, async (ctx: Router.RouterContext) => {
    ctx.status = 403;
  });

  return router;
}
