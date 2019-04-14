import * as Router from 'koa-router';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { connection, STATES } from 'mongoose';

export const dbConnectionMiddleware: Router.IMiddleware = async (ctx: Router.RouterContext, next: any) => {
    if (connection.readyState !== STATES.connected && process.env.NODE_ENV !== 'test') {
        ctx.body = 'No database connection';
        ctx.status = INTERNAL_SERVER_ERROR;
        return;
    }
    await next();
};
