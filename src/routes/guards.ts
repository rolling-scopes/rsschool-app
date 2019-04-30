import { UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
const auth = require('koa-basic-auth'); //tslint:disable-line
import { config } from '../config';

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });

export const guard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
    return basicAuthAdmin(ctx, next);
  } else {
    ctx.status = UNAUTHORIZED;
  }
};

export const adminGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && ctx.state.user.isAdmin) {
    await next();
    return;
  }
  return basicAuthAdmin(ctx, next);
};
