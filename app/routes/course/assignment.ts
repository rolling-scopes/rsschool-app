import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { AssignmentModel, IApiResponse, IAssignmentModel, TaskModel } from '../../models';
import { setResponse } from '../utils';

export const courseAssignmentGetRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { courseId, studentId } = ctx.params;
        const assignments = await AssignmentModel.find({
            courseId,
            studentId,
        }).exec();

        const taskIdCollection: string[] = [];
        for (const index in assignments) {
            if (assignments[index]) {
                taskIdCollection.push(assignments[index].taskId);
            }
        }
        const tasks = await TaskModel.find({
            _id: taskIdCollection,
        }).exec();

        const tasksForAggregationWithAssignments: any = tasks;
        const aggregatedAssignments: any = assignments;

        for (const index in aggregatedAssignments) {
            if (aggregatedAssignments.hasOwnProperty(index)) {
                aggregatedAssignments[index]._doc = {
                    ...tasksForAggregationWithAssignments[index]._doc,
                    ...aggregatedAssignments[index]._doc,
                };
            }
        }

        const body: IApiResponse<IAssignmentModel> = {
            data: aggregatedAssignments,
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
