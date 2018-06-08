import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { FeedRecordDocument } from '../../models';
import { userService } from '../../services';
import { setResponse } from '../utils';

async function getFeedRecords(userId: string) {
    return FeedRecordDocument.find({
        userId,
    })
        .sort({ dateTime: -1 })
        .exec();
}

export const getFeedRoute = async (ctx: Router.IRouterContext) => {
    const userId = ctx.state.user!._id;

    const user = await userService.getUserById(userId);
    if (user == null) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    const feedRecords = await getFeedRecords(userId);
    setResponse(ctx, OK, feedRecords);
};
