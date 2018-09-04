import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { AssignmentModel, IApiResponse, IAssignmentModel } from '../../models';
import { setResponse } from '../utils';

export const courseAssignmentGetRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { courseId, studentId } = ctx.params;
        const assignments = await AssignmentModel.find({
            courseId,
            studentId,
        })
            .populate('taskId')
            .exec();

        const body: IApiResponse<IAssignmentModel> = {
            data: assignments,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const courseAssignmentPatchRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { courseId, studentId, taskId } = ctx.params;
        const newAssignment = { ...ctx.request.body };
        await timeout(2000);
        newAssignment.status = 'Checked';
        newAssignment.score = Math.floor(Math.random() * 100);
        const result = await AssignmentModel.findOneAndUpdate(
            {
                courseId,
                studentId,
                taskId,
            },
            newAssignment,
        ).exec();
        setResponse(ctx, OK, result);
        ctx.body = newAssignment;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
