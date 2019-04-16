import { NOT_FOUND } from 'http-status-codes';
import * as Router from 'koa-router';
import { userService } from '../../services';
// import { setResponse } from '../utils';

export const getParticipationsRoute = async (ctx: Router.RouterContext) => {
    const userId = ctx.state.user!._id;
    const user = await userService.getUserByGithubId(userId);
    if (user === null) {
        ctx.status = NOT_FOUND;
        return;
    }
    // setResponse(ctx, OK, user.participations);
};
