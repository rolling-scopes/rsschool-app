import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { EventModel, IApiResponse, IEventModel } from '../../models';

export const courseEventsRoute = async (ctx: Router.RouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const events = await EventModel.find({ courseId }).exec();
        const body: IApiResponse<IEventModel> = {
            data: events,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
