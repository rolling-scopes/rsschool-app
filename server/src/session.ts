import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import { IUserSession } from './models';

export function replaceSession(ctx: Router.RouterContext, session: Partial<IUserSession>) {
  // inject dev user into passport's session
  const key = (passport as any)._key;
  if (!ctx.session) {
    return;
  }
  ctx.session[key] = {
    user: session,
  };
}

export function updateSession(ctx: Router.RouterContext, session: Partial<IUserSession>) {
  // inject dev user into passport's session
  const key = (passport as any)._key;
  if (!ctx.session || !ctx.session[key] || !ctx.session[key].user) {
    return;
  }
  const currentSession = ctx.session[key].user;
  ctx.session[key].user = {
    ...currentSession,
    roles: {
      ...currentSession.roles,
      ...session.roles,
    },
  };
}
