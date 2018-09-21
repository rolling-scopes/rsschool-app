import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';

import { userService } from '../../services';
import { Roles, IUserModel } from './../../models/user';
import { setResponse, toArray } from '../utils';

export const matchUsers = async (ctx: Router.IRouterContext) => {
    const {
        data: { role, forCheck },
    } = ctx.request.body;

    const users = await userService.getBunchUsers(toArray(forCheck), Roles[role] as Roles);

    if (users.length === 0) {
        setResponse(ctx, NOT_FOUND, []);
        return;
    }

    const matchedIds = users.map((user: IUserModel) => user._id);

    setResponse(ctx, OK, matchedIds);
};
