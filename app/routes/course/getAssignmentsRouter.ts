import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { IApiResponse } from '../../models';
import { AssignmentsModel, IAssignmentsModel } from '../../models/assignments';

export const getAssignments = async (ctx: Router.IRouterContext) => {
    const userId = ctx.state.user!._id;
    if (connection.readyState !== STATES.connected) {
        ctx.status = INTERNAL_SERVER_ERROR;
        return;
    }
    try {
        const tasks = await AssignmentsModel.find({
            studentId: userId,
        }).exec();
        const body: IApiResponse<IAssignmentsModel> = {
            data: tasks,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
