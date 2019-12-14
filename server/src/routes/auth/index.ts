import { FORBIDDEN } from 'http-status-codes';
import passport from 'koa-passport';
import Router from 'koa-router';
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

  router.get('/github/callback', passport.authenticate('github', { failureFlash: true }), ctx => {
    if (ctx.isAuthenticated() || config.isDevMode) {
      (ctx.logger as ILogger).info('Successfully authenticated', { query: JSON.stringify(ctx.query) });
      ctx.redirect(config.auth.successRedirect);
    } else {
      ctx.status = FORBIDDEN;
    }
  });

  return router;
}
