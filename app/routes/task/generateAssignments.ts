import {
    CourseStudentModel,
    ICourseStudentModel,
    AssignmentModel,
    IAssignmentHalf,
    AssignmentStatus,
} from '../../models';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { Document } from 'mongoose';
import * as Router from 'koa-router';

export default function postTaskAndGenerateAssignments<T extends Document>(DocumentModel: new (data: any) => T) {
    return async (ctx: Router.IRouterContext) => {
        const model = new DocumentModel(ctx.request.body);
        ctx.body = {};

        try {
            ctx.body = await model.save();
            generateAssignments(ctx);

            ctx.status = OK;
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to save document');
        }
    };
}

const generateAssignments = async (ctx: Router.IRouterContext) => {
    const { _id, courseId, endDate } = ctx.body;
    const userByCourseId = await groupUsersByCourseId(courseId);

    userByCourseId.forEach((item: any) => {
        const assignment: IAssignmentHalf = {
            courseId,
            deadlineDate: endDate,
            mentorId: item.mentorId,
            status: AssignmentStatus.Assigned,
            studentId: item.userId,
            taskId: _id,
        };
        AssignmentModel.create(assignment, (error: any) => {
            if (error) {
                ctx.logger.error(error, 'Failed to save document');
            }
        });
    });
};

const groupUsersByCourseId = async (courseId: string) => {
    const userWithCourseId: ICourseStudentModel[] = await CourseStudentModel.find({
        courseId,
    }).exec();
    return userWithCourseId;
};
