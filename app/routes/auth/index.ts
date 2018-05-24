import { Context, Middleware } from 'koa';
import * as passport from 'koa-passport';
import * as Router from 'koa-router';
import { config } from '../../config';
import { ILogger } from '../../logger';

export const guard: Middleware = async (ctx: Context, next) => {
    if (ctx.isAuthenticated()) {
        await next();
    } else {
        ctx.status = 401;
    }
};

export function authRoute(_: ILogger) {
    const router = new Router({ prefix: '/auth' });

    router.get('/github', passport.authenticate('github'));

    router.get('/github/callback', passport.authenticate('github'), ctx => {
        if (ctx.isAuthenticated()) {
            ctx.redirect(config.auth.successRedirect);
        } else {
            ctx.status = 403;
        }
    });

    router.get('/success', ctx => {
        ctx.status = 200;
        ctx.body = ctx.state.user;
    });

    return router;
}
