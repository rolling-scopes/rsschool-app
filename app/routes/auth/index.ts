import { Middleware } from 'koa';
import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import { config } from '../../config';
import { ILogger } from '../../logger';
import { FORBIDDEN, UNAUTHORIZED, OK } from 'http-status-codes';

export const guard: Middleware = async (ctx: Router.IRouterContext, next) => {
    if ((ctx.state.user != null && ctx.isAuthenticated()) || config.isDevMode) {
        await next();
    } else {
        ctx.status = UNAUTHORIZED;
    }
};

export function authRoute(_: ILogger) {
    const router = new Router({ prefix: '/auth' });

    router.get('/github', passport.authenticate('github'));

    router.get('/github/callback', passport.authenticate('github'), ctx => {
        if (ctx.isAuthenticated()) {
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
