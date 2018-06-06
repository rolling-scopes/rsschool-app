import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse, IUser, IUserSession, UserDocument } from '../../models';

export * from './profile';
export * from './participations';
export * from './feed';

export function userRoute(logger: ILogger) {
    const router = new Router({ prefix: '/user' });

    router.get('/', async (ctx: Router.IRouterContext) => {
        try {
            const user: IUserSession = ctx.state.user!;
            const data = await UserDocument.findById(user._id).exec();
            if (data === null) {
                ctx.status = NOT_FOUND;
                return;
            }

            const body: IApiResponse<IUser> = {
                data,
            };
            ctx.body = body;
            ctx.status = OK;
        } catch (err) {
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    });

    return router;
}
