import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IUserParticipation, UserDocument } from '../../models';

export function userParticipationsRoute(_: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/participations', async ctx => {
        const userSession = ctx.state.user!;
        const user = await UserDocument.findById(userSession._id);
        if (user === null) {
            ctx.status = NOT_FOUND;
            return;
        }
        const body: IApiResponse<IUserParticipation[]> = {
            data: user.participations,
        };
        ctx.body = body;
        ctx.status = OK;
    });

    return router;
}
