import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IUserProfile, IUserSession, UserDocument } from '../../models';

export function userProfileRoute(_: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/profile', async ctx => {
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
        const body: IApiResponse<IUserProfile> = {
            data: result.profile as IUserProfile,
        };
        ctx.body = body;
        ctx.status = 200;
    });

    router.patch('/profile', async ctx => {
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

        const body: IApiResponse<IUserProfile> = {
            data: (await doc.save()).profile as IUserProfile,
        };
        ctx.body = body;
        ctx.status = 200;
    });

    return router;
}
