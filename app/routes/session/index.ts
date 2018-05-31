import * as Router from 'koa-router';
import { config } from '../../config';
import { ILogger } from '../../logger';
import { IUserSession } from '../../models';

export function sessionRoute(_: ILogger) {
    const router = new Router();

    router.get('/session', ctx => {
        if (config.isDevMode) {
            ctx.status = 200;
            const user: IUserSession = {
                _id: 'dev-user',
                isAdmin: true,
                role: 'mentor',
            };
            ctx.body = user;
            return;
        }
        if (ctx.state.user == null) {
            ctx.status = 404;
            return;
        }
        ctx.status = 200;
        ctx.body = ctx.state.user;
    });

    return router;
}
