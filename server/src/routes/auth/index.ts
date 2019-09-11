import { FORBIDDEN, OK } from 'http-status-codes';
import passport from 'koa-passport';
import Router from 'koa-router';

import { config } from '../../config';
import { devAuthMiddleware } from './devAuthMiddleware';

export function authRoute() {
  const router = new Router({ prefix: '/auth' });

  router.get('/github', config.isDevMode ? devAuthMiddleware : passport.authenticate('github'));

  router.get('/github/callback', passport.authenticate('github', { failureFlash: true }), ctx => {
    if (ctx.isAuthenticated() || config.isDevMode) {
      ctx.logger.info('Successfully authenticated');
      ctx.redirect(config.auth.successRedirect);
    } else {
      ctx.status = FORBIDDEN;
    }
  });

  router.get('/success', ctx => {
    ctx.status = OK;
    ctx.body = ctx.state.user;
  });

  return router;
}
