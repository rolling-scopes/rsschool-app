import * as Router from 'koa-router';
import { config } from '../../config';
import { ILogger } from '../../logger';
import { IApiResponse, IUserSession } from '../../models';
import { NOT_FOUND, OK } from 'http-status-codes';

const devUserSession: IUserSession = {
    _id: 'dev-user',
    isAdmin: true,
    role: 'mentor',
};

export async function sessionMiddleware(ctx: Router.IRouterContext) {
    if (config.isDevMode) {
        ctx.status = OK;
        const user: IApiResponse<IUserSession> = {
            data: devUserSession,
        };
        ctx.body = user;
        return;
    }
    if (ctx.state.user == null) {
        ctx.status = NOT_FOUND;
        return;
    }
    ctx.status = OK;
    const body: IApiResponse<IUserSession> = {
        data: ctx.state.user as IUserSession,
    };
    ctx.body = body;
}

export function sessionRoute(_: ILogger) {
    const router = new Router();

    router.get('/session', sessionMiddleware);

    return router;
}
