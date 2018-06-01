import * as Router from 'koa-router';
import { config } from '../../config';
import { ILogger } from '../../logger';
import { IApiResponse, IUserSession } from '../../models';

export function sessionRoute(_: ILogger) {
    const router = new Router();

    router.get('/session', ctx => {
        if (config.isDevMode) {
            ctx.status = 200;
            const user: IApiResponse<IUserSession> = {
                data: {
                    _id: 'dev-user',
                    isAdmin: true,
                    role: 'mentor',
                },
            };
            ctx.body = user;
            return;
        }
        if (ctx.state.user == null) {
            ctx.status = 404;
            return;
        }
        ctx.status = 200;
        const body: IApiResponse<IUserSession> = {
            data: ctx.state.user,
        };
        ctx.body = body;
    });

    return router;
}
