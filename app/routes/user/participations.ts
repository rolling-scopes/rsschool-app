import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IParticipation, IUserSession, ParticipationDocument, UserDocument } from '../../models';

export function userParticipationsRoute(_: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/participations', async ctx => {
        const userSession: IUserSession = ctx.state.user;
        const user = await UserDocument.findById(userSession._id);
        if (user === null) {
            ctx.status = 404;
            return;
        }
        const result = await ParticipationDocument.find({
            userId: user._id,
        }).exec();

        const body: IApiResponse<IParticipation> = {
            data: result,
        };
        ctx.body = body;
        ctx.status = 200;
    });

    return router;
}
