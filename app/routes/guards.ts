import { UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
import { config } from '../config';

export const guard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
    if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
        await next();
    } else {
        ctx.status = UNAUTHORIZED;
    }
};

export const adminGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
    if (ctx.state.user != null && ctx.state.user.isAdmin) {
        await next();
    } else {
        ctx.status = UNAUTHORIZED;
    }
};
