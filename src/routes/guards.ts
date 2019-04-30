import * as Router from 'koa-router';
const auth = require('koa-basic-auth'); //tslint:disable-line
import { config } from '../config';

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });

export const guard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
    await next();
    return;
  }
  return basicAuthAdmin(ctx, next);
};

export const adminGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && ctx.state.user.isAdmin) {
    await next();
    return;
  }
  return basicAuthAdmin(ctx, next);
};
