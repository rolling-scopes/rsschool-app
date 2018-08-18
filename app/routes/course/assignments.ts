import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { IApiResponse, AssignmentModel, IAssignmentModel, IUserSession } from '../../models';

export const courseAssignmentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        const { id: courseId } = ctx.params;
        const studentId: string = userSession._id;
        const asignments = await AssignmentModel.find({ courseId, studentId }).exec();
        const body: IApiResponse<IAssignmentModel> = {
            data: asignments,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
