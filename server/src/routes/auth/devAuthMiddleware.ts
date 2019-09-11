import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { userInfo, hostname } from 'os';
import Router from 'koa-router';
import { config } from '../../config';
import { createUser } from '../../rules';
import { replaceSession } from '../../session';

export const devAuthMiddleware = async (ctx: Router.RouterContext) => {
  try {
    const userSession = await createUser(
      {
        username: config.dev.username || `${userInfo().username}@${hostname()}`,
      },
      config.roles.adminTeams,
    );
    replaceSession(ctx, userSession);
    ctx.redirect(config.auth.successRedirect);
  } catch (err) {
    ctx.status = INTERNAL_SERVER_ERROR;
  }
};
