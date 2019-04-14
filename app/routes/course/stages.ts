import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { StageModel, IApiResponse, IStageModel } from '../../models';

export const courseStagesRoute = async (ctx: Router.RouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const stages = await StageModel.find({ courseId }).exec();
        const body: IApiResponse<IStageModel> = {
            data: stages,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
