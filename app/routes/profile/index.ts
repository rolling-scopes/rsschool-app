import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IUserSession, UserDocument } from '../../models';

export function profileRoute(_: ILogger) {
    const router = new Router({ prefix: '/profile' });

    router.get('/', async ctx => {
        const user: IUserSession = ctx.state.user;
        if (user === null) {
            ctx.status = 401;
            return;
        }
        const result = await UserDocument.findById(user._id);
        if (result === null) {
            ctx.status = 404;
            return;
        }
        ctx.body = {
            data: result.profile,
        };
        ctx.status = 200;
    });

    router.patch('/', async ctx => {
        const user: IUserSession = ctx.state.user;
        if (user === null) {
            ctx.status = 401;
            return;
        }
        const result = await UserDocument.findById(user._id);
        if (result === null) {
            ctx.status = 404;
            return;
        }

        const doc = new UserDocument(result);
        doc.profile = { ...doc.profile, ...ctx.request.body };
        ctx.body = {
            data: (await doc.save()).profile,
        };
        ctx.status = 200;
    });

    return router;
}
