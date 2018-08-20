import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { SessionModel, IApiResponse, IEventModel, TaskModel } from '../../models';

export const courseEventsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const events = await SessionModel.find({ courseId }).exec();
        const tasks = await TaskModel.find({ courseId }).exec();
        const result: IEventModel[] = [...events, ...tasks];
        const body: IApiResponse<IEventModel> = {
            data: result,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
