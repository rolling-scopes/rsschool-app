import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { userService } from '../../services';
import { setResponse } from '../utils';

export const getParticipationsRoute = async (ctx: Router.IRouterContext) => {
    const userId = ctx.state.user!._id;
    const user = await userService.getUserById(userId);
    if (user === null) {
        ctx.status = NOT_FOUND;
        return;
    }
    setResponse(ctx, OK, user.participations);
};
