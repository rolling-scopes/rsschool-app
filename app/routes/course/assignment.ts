import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { AssignmentModel, IApiResponse, IAssignmentModel, TaskModel } from '../../models';
import { setResponse } from '../utils';

export const courseAssignmentGetRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { courseId } = ctx.params;
        const studentId: string = ctx.state.user!._id;
        const assignments = await AssignmentModel.find(
            {
                courseId,
                studentId,
            },
            {
                courseId: 1,
                score: 1,
                status: 1,
                studentId: 1,
                taskId: 1,
            },
        ).exec();

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

export const courseAssignmentPatchRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { courseId } = ctx.params;
        const studentId: string = ctx.state.user!._id;
        const taskId: string = ctx.request.body.taskId;
        const newAssignment = { ...ctx.request.body };
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
