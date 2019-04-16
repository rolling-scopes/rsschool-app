import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { User } from '../models-pg';
import { ILogger } from '../logger';
import { getManager } from 'typeorm';
import { setResponse } from '../routes/utils';

export function publicMeRouter(_: ILogger) {
    const router = new Router({ prefix: '/v2/me' });

    router.get('/', async (ctx: Router.RouterContext) => {
        const githubId = ctx.state!.user.id;
        console.info(githubId);
        const user = await getManager().findOne(User, { where: { githubId } });
        if (user === undefined) {
            setResponse(ctx, NOT_FOUND);
            return;
        }
        setResponse(ctx, OK, user);
    });

    return router;
}
