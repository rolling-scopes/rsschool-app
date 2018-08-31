import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { IRouterContext } from 'koa-router';
import { Document } from 'mongoose';
import { AssignmentsModel } from '../../models/assignments';
import { CourseStudentModel } from '../../models/courseStudent';

export function createPostRoute<T extends Document>(DocumentModel: new (data: any) => T) {
    return async (ctx: IRouterContext) => {
        try {
            const model: any = new DocumentModel(ctx.request.body);
            await model.save();
            const validationResult = model.validateSync();
            ctx.body = {};

            if (validationResult !== undefined) {
                ctx.status = BAD_REQUEST;
                return;
            }
            if (ctx.request.body.type === 'task') {
                const students = await CourseStudentModel.find({
                    courseId: ctx.request.body.courseId,
                }).exec();
                students.forEach(async student => {
                    const assignment = {
                        assigmentRepo: model.urlToDescription,
                        checkDate: 0,
                        completeDate: model.endDateTime - model.startDateTime,
                        courseId: student.courseId,
                        deadlineDate: model.endDateTime,
                        mentorComment: '',
                        mentorId: '',
                        score: 0,
                        status: 'Assigned',
                        studentComment: '',
                        studentId: student.userId,
                        taskId: model._id,
                        title: model.title,
                    };
                    const assignmentStudent = new AssignmentsModel(assignment);
                    await AssignmentsModel.bulkWrite([{ insertOne: { document: assignmentStudent } }]);
                });
            }
            ctx.body = await model.save();
            ctx.status = OK;
        } catch (e) {
            ctx.status = INTERNAL_SERVER_ERROR;
            ctx.logger.error(e, 'Failed to save document');
        }
    };
}
