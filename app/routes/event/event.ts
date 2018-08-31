import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';
import { connection, STATES, Types } from 'mongoose';
import * as Router from 'koa-router';
import { setResponse } from '../utils';
import {
    IApiResponse,
    IEventModel,
    ITaskModel,
    EventModel,
    EventType,
    TaskModel,
    IUserSession,
    AssignmentModel,
    AssignmentStatus,
    ICourseStudent,
    CourseStudentModel,
    ICourseStudentModel,
} from '../../models';
export const createPostRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        switch (ctx.request.body.type) {
            case 'task': {
                const task = new TaskModel({
                    ...ctx.request.body,
                    author: userSession._id,
                });
                ctx.body = {};
                ctx.body = await task.save();
                ctx.status = OK;
                const students: any = await getStudentsByCourseId(ctx.request.body.courseId);
                const assignments: any = students.map((elem: ICourseStudentModel) => {
                    const assignment = createAsignment(task, elem, ctx.request.body.courseId, AssignmentStatus);
                    return { insertOne: { document: assignment } };
                });
                await AssignmentModel.bulkWrite(assignments);
                break;
            }
            case 'session': {
                const event = new EventModel(ctx.request.body);
                ctx.body = await event.save();
                ctx.status = OK;
                break;
            }
            default:
                return;
        }
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to save document');
    }
};
export const createGetRoute = async (ctx: Router.IRouterContext) => {
    const options: { useObjectId: boolean } = { useObjectId: true };
    try {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }
        const data =
            (await EventModel.findById(options.useObjectId ? Types.ObjectId(ctx.params.id) : ctx.params.id).exec()) ||
            (await TaskModel.findById(options.useObjectId ? Types.ObjectId(ctx.params.id) : ctx.params.id).exec());
        if (data === null) {
            ctx.body = {};
            ctx.status = NOT_FOUND;
            return;
        }
        const body: IApiResponse<IEventModel | ITaskModel> = {
            data,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

export const createDeleteRoute = async (ctx: Router.IRouterContext) => {
    const { id, eventType } = ctx.params;
    try {
        if (eventType === EventType.Session) {
            await EventModel.findByIdAndRemove(id);
        } else {
            const queryTask = await TaskModel.findByIdAndRemove(id);
            if (queryTask !== null) {
                await AssignmentModel.remove({ taskId: id });
            } else {
                setResponse(ctx, NOT_FOUND);
                return;
            }
        }
        setResponse(ctx, OK);
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to remove document');
    }
};

export const createPatchRoute = async (ctx: Router.IRouterContext) => {
    try {
        const result = await patcModel(ctx);
        if (result === null) {
            setResponse(ctx, NOT_FOUND);
            return;
        }
        setResponse(ctx, OK, result);
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to update document');
    }
};
const patcModel = async (ctx: Router.IRouterContext) => {
    const { _id, ...body } = ctx.request.body;
    if (body.type === EventType.Session) {
        const result = await EventModel.findByIdAndUpdate(_id, body, { new: true });
        return result;
    } else {
        const result = await TaskModel.findByIdAndUpdate(_id, body, { new: true });
        await AssignmentModel.updateMany({ taskId: _id }, body, { new: true });
        return result;
    }
};
const createAsignment = (taskElement: ITaskModel, student: any, ctxCourseId: string, StatusAssignment: any) => {
    const assignment = new AssignmentModel({
        assignmentRepo: taskElement.urlToDescription,
        checkDate: 0,
        completeDate: 0,
        courseId: ctxCourseId,
        deadlineDate: taskElement.endDateTime,
        mentorComment: '',
        mentorId: student.mentors.githubId,
        score: 0,
        status: StatusAssignment.Assigned,
        studentComment: '',
        studentId: student.userId,
        taskId: taskElement.id,
        title: taskElement.title,
    });
    return assignment;
};
const getStudentsByCourseId = async (ctxCourseId: string) => {
    const result: ICourseStudent[] = await CourseStudentModel.find({ courseId: ctxCourseId }).exec();
    return result;
};
