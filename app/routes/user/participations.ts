import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IUserParticipation, IUserSession, UserDocument } from '../../models';

export function userParticipationsRoute(_: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/participations', async ctx => {
        const userSession: IUserSession = ctx.state.user;
        const user = await UserDocument.findById(userSession._id);
        if (user === null) {
            ctx.status = 404;
            return;
        }
        const body: IApiResponse<IUserParticipation[]> = {
            data: user.participations,
        };
        ctx.body = body;
        ctx.status = 200;
    });

    return router;
}
