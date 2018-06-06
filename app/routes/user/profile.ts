import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IUserProfile, IUserSession, UserDocument } from '../../models';
import { NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';

export function userProfileRoute(_: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/profile', async ctx => {
        const user: IUserSession = ctx.state.user!;
        if (user === null) {
            ctx.status = UNAUTHORIZED;
            return;
        }
        const result = await UserDocument.findById(user._id);
        if (result === null) {
            ctx.status = NOT_FOUND;
            return;
        }
        const body: IApiResponse<IUserProfile> = {
            data: result.profile as IUserProfile,
        };
        ctx.body = body;
        ctx.status = OK;
    });

    router.patch('/profile', async ctx => {
        const user: IUserSession = ctx.state.user!;
        if (user === null) {
            ctx.status = UNAUTHORIZED;
            return;
        }
        const result = await UserDocument.findById(user._id);
        if (result === null) {
            ctx.status = NOT_FOUND;
            return;
        }

        const doc = new UserDocument(result);
        doc.profile = { ...doc.profile, ...ctx.request.body };

        const body: IApiResponse<IUserProfile> = {
            data: (await doc.save()).profile as IUserProfile,
        };
        ctx.body = body;
        ctx.status = OK;
    });

    return router;
}
