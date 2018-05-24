import * as Router from 'koa-router';
import { ILogger } from '../../logger';

export function sessionRoute(_: ILogger) {
    const router = new Router();

    router.get('/session', ctx => {
        if (ctx.state.user == null) {
            ctx.status = 404;
            return;
        }
        ctx.status = 200;
        ctx.body = ctx.state.user;
    });

    return router;
}
