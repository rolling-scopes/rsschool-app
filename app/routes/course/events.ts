import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { LectureModel, TaskModel, IApiResponse, IEventModel } from '../../models';

export const courseEventsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const lectures = await LectureModel.find({ courseId }).exec();
        const tasks = await TaskModel.find({ courseId }).exec();
        const events = [...lectures, ...tasks];
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
