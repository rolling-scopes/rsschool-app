import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../routes/utils';
import { getManager } from 'typeorm';
import { User } from '../models-pg/user';

export function userRouter() {
    const router = new Router({ prefix: '/v2/user' });

    router.get('/:id', getUserRoute);
    router.post('/', postUserRoute);

    return router;
}

export const getUserRoute = async (ctx: Router.IRouterContext) => {
    const userId = ctx.params.id;
    const user = await getManager().findOne(User, Number(userId));
    if (user === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, user);
};

export const postUserRoute = async (ctx: Router.IRouterContext) => {
    const users = ctx.request.body as User[];
    console.info(users);
    try {
        const result = await getManager().save(User, users);
        setResponse(ctx, OK, result);
    } catch (e) {
        setResponse(ctx, BAD_REQUEST, { message: e.message });
    }
};
