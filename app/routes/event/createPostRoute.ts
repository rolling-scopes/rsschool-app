import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { IRouterContext } from 'koa-router';
import { Document } from 'mongoose';
import { TaskModel } from '../../models/tasks';
import { AssignmentsModel } from '../../models/assignments';
import { CourseStudentModel } from '../../models/courseStudent';

export function createPostRoute<T extends Document>(DocumentModel: new (data: any) => T) {
    return async (ctx: IRouterContext) => {
        const model = new DocumentModel(ctx.request.body);
        const validationResult = model.validateSync();
        ctx.body = {};

        if (validationResult !== undefined) {
            ctx.status = BAD_REQUEST;
            return;
        }
        try {
            if (ctx.request.body.type === 'task') {
                const documentModelTask = new DocumentModel(ctx.request.body);
                const modelTask = new TaskModel(documentModelTask);
                await modelTask.save();
                const students = await CourseStudentModel.find({
                    courseId: ctx.request.body.courseId,
                }).exec();
                students.forEach(async student => {
                    const assignment = {
                        assigmentRepo: modelTask.urlToDescription,
                        checkDate: 0,
                        completeDate: modelTask.endDateTime - modelTask.startDateTime,
                        courseId: student.courseId,
                        deadlineDate: modelTask.endDateTime,
                        mentorComment: '',
                        mentorId: '',
                        score: 0,
                        status: 'Assigned',
                        studentComment: '',
                        studentId: student.userId,
                        taskId: modelTask._id,
                        title: modelTask.title,
                    };
                    const assignments = new AssignmentsModel(assignment);
                    await assignments.save();
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
