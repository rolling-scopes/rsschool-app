import {
    CourseStudentModel,
    ICourseStudentModel,
    AssignmentModel,
    IGeneratedAssignment,
    AssignmentStatus,
    IAssignment,
} from '../../models';
import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';
import { Document, Model } from 'mongoose';
import * as Router from 'koa-router';

export function postTaskAndGenerateAssignments<T extends Document>(DocumentModel: new (data: any) => T) {
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

export function deleteTaskAndAssignments<T extends Document>(DocumentModel: Model<T>) {
    return async (ctx: Router.IRouterContext) => {
        const { id } = ctx.params;
        try {
            const query = await DocumentModel.findByIdAndRemove(id);
            if (query === null) {
                ctx.status = NOT_FOUND;
                return;
            }
            await deleteAssignments(id);

            ctx.status = OK;
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to remove document');
        }
    };
}

const generateAssignments = async (ctx: Router.IRouterContext) => {
    const { _id, courseId, endDate } = ctx.body;
    const userByCourseId = await groupUsersByCourseId(courseId);
    const operations: any = [];
    userByCourseId.forEach((item: any) => {
        const assignment: IGeneratedAssignment = {
            courseId,
            deadlineDate: endDate,
            mentorId: item.mentorId,
            status: AssignmentStatus.Assigned,
            studentId: item.userId,
            taskId: _id,
        };
        operations.push({ insertOne: { document: assignment } });
    });
    AssignmentModel.bulkWrite(operations);
};

const groupUsersByCourseId = async (courseId: string) => {
    const userWithCourseId: ICourseStudentModel[] = await CourseStudentModel.find(
        {
            courseId,
        },
        {
            mentorId: 1,
            userId: 1,
        },
    ).exec();
    return userWithCourseId;
};

const groupAssignmentByTaskId = async (taskId: string) => {
    const assignmentWithTaskId: IAssignment[] = await AssignmentModel.find(
        {
            taskId,
        },
        {
            _id: 1,
        },
    ).exec();
    return assignmentWithTaskId;
};

const deleteAssignments = async (id: string) => {
    const assignmentByTaskId = await groupAssignmentByTaskId(id);
    const operations: any = [];
    assignmentByTaskId.forEach((item: any) => {
        operations.push({ deleteOne: { filter: item } });
    });
    AssignmentModel.bulkWrite(operations);
};
