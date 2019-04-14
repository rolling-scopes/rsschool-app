import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { userService } from '../../services';
import { setResponse } from '../utils';

export const getProfileRoute = async (ctx: Router.RouterContext) => {
    const userId = ctx.state.user!._id;
    const user = await userService.getUserById(userId);
    if (user === null) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, user.profile);
};

export const patchProfileRoute = async (ctx: Router.RouterContext) => {
    const userId = ctx.state.user!._id;
    const user = await userService.getUserById(userId);
    if (user === null) {
        setResponse(ctx, NOT_FOUND);
        return;
    }

    user.profile = { ...user.profile, ...ctx.request.body };
    await user.save();

    setResponse(ctx, OK, user.profile);
};
