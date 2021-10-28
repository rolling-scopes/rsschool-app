import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { userInfo, hostname } from 'os';
import Router from '@koa/router';
import { config } from '../../config';
import { createUser } from '../../rules';
import { replaceSession } from '../../session';
import { Profile } from 'passport-github2';

export const devAuthMiddleware = async (ctx: Router.RouterContext) => {
  try {
    const userSession = await createUser(
      {
        provider: '',
        id: '',
        username: config.dev.username || `${userInfo().username}@${hostname()}`,
      } as Profile,
      config.dev.adminEnabled,
    );
    replaceSession(ctx, userSession);
    const url = ctx.query.url;
    const query = url ? decodeURIComponent(url) : '';
    ctx.redirect(config.auth.successRedirect + query);
  } catch (err) {
    ctx.status = INTERNAL_SERVER_ERROR;
  }
};
