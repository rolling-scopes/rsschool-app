import { OK } from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import Router from '@koa/router';
import { guard } from '../guards';
import { config } from '../../config';
import { ILogger } from '../../logger';

export function jwtRoute(_: ILogger) {
  const router = new Router<any, any>();

  router.get('/jwt', guard, ctx => {
    ctx.status = OK;
    ctx.body = {
      token: jsonwebtoken.sign(
        {
          ...ctx.state.user,
          exp: Math.floor((Date.now() + config.sessionAge) / 1000),
        },
        config.sessionKey,
      ),
    };
  });

  return router;
}
