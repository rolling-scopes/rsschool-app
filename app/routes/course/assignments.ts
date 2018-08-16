import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { IApiResponse, AssignmentModel, TaskModel, IAssignmentModel } from '../../models';
import { ITaskModel } from '../../models/task';

export const courseAssignmentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId /* userId: userId */ } = ctx.params;
        const userId = 'brody.moen19';
        const assignments: any = await getAssignmentsByCourseId(courseId, userId);
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

export const courseTasksRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId /* userId: userId */ } = ctx.params;
        const userId = 'brody.moen19';
        const assignments: any = await getAssignmentsByCourseId(courseId, userId);
        const arrayOfTasksId: any = [];
        for (const index in assignments) {
            if (assignments[index]) {
                arrayOfTasksId.push(assignments[index].taskId);
            }
        }
        const tasks: any = await TaskModel.find({ _id: arrayOfTasksId }).exec();
        const body: IApiResponse<ITaskModel> = {
            data: tasks,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

const getAssignmentsByCourseId = async (courseId: string, studentId: string) => {
    return AssignmentModel.find({ courseId, studentId }).exec();
};
