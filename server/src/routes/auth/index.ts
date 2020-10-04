import { FORBIDDEN } from 'http-status-codes';
import passport from 'koa-passport';
import Router from '@koa/router';
import { ILogger } from '../../logger';

import { config } from '../../config';
import { devAuthMiddleware } from './devAuthMiddleware';

export function authRoute() {
  const router = new Router({ prefix: '/auth' });

  router.get(
    '/github',
    config.isDevMode
      ? devAuthMiddleware
      : (ctx, next) => passport.authenticate('github', { state: ctx.query.url })(ctx, next),
  );

  router.get('/logout', async (ctx: any) => {
    await ctx.logout();
    ctx.session = null;
    ctx.redirect('/');
  });

  router.get('/github/callback', passport.authenticate('github', { failureFlash: true }), (ctx) => {
    if (ctx.isAuthenticated() || config.isDevMode) {
      (ctx.logger as ILogger).info('Successfully authenticated');
      const state = ctx.query?.state;
      const url = state ? decodeURIComponent(state) : '';
      ctx.redirect(`${config.auth.successRedirect}${url}`);
    } else {
      ctx.status = FORBIDDEN;
    }
  });

  return router;
}
