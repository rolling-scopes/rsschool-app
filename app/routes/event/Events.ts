import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';
import { connection, STATES, Types } from 'mongoose';
import * as Router from 'koa-router';
import { setResponse } from '../utils';

import {
    IApiResponse,
    IEventModel,
    TaskModel,
    SessionModel,
    IUserSession,
    AssignmentModel,
    AssignmentStatus,
    ICourseStudent,
    CourseStudentModel,
} from '../../models';

export const createPostEventsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        const body = ctx.request.body;
        const { _id: userId } = userSession;
        const { type, courseId } = body;
        switch (type) {
            case 'task': {
                const event = new TaskModel({
                    ...body,
                    author: userId,
                });
                ctx.body = {};
                ctx.body = await event.save();
                ctx.status = OK;
                await createAssignments(event, courseId);
                break;
            }
            case 'session': {
                const event = new SessionModel(body);
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

const createAssignments = async (event: IEventModel, courseId: string) => {
    const students: ICourseStudent[] = await getStudentsByCourseId(courseId);
    const assignments: any = students.map((student: ICourseStudent) => {
        const assignment = new AssignmentModel({
            courseId,
            deadlineDate: event.endDateTime,
            mentorId: student.mentors,
            score: 0,
            status: AssignmentStatus.Assigned,
            studentId: student.userId,
            taskId: event.id,
        });
        return { insertOne: { document: assignment } };
    });
    await AssignmentModel.bulkWrite(assignments);
};

export const createDeleteEventsRoute = async (ctx: Router.IRouterContext) => {
    const { id, eventType } = ctx.params;
    try {
        const query =
            eventType === 'session' ? await SessionModel.findByIdAndRemove(id) : await TaskModel.findByIdAndRemove(id);
        if (query !== null) {
            await AssignmentModel.remove({ taskId: id });
        } else {
            setResponse(ctx, NOT_FOUND);
            return;
        }
        setResponse(ctx, OK);
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to remove document');
    }
};

export const createPatchEventsRoute = async (ctx: Router.IRouterContext) => {
    const { _id, ...body } = ctx.request.body;
    const { eventType } = ctx.params;
    try {
        const result =
            eventType === 'session'
                ? await SessionModel.findByIdAndUpdate(_id, body, { new: true })
                : await TaskModel.findByIdAndUpdate(_id, body, { new: true });
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

export const createGetEventsRoute = async (ctx: Router.IRouterContext) => {
    const options: { useObjectId: boolean } = { useObjectId: true };
    try {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }
        const data =
            (await SessionModel.findById(options.useObjectId ? Types.ObjectId(ctx.params.id) : ctx.params.id).exec()) ||
            (await TaskModel.findById(options.useObjectId ? Types.ObjectId(ctx.params.id) : ctx.params.id).exec());
        if (data === null) {
            ctx.body = {};
            ctx.status = NOT_FOUND;
            return;
        }
        const body: IApiResponse<IEventModel> = {
            data,
        };
        ctx.body = body;
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

const getStudentsByCourseId = async (courseId: string) => {
    const result: ICourseStudent[] = await CourseStudentModel.aggregate([
        {
            $match: {
                courseId,
            },
        },
        {
            $lookup: {
                as: 'user',
                foreignField: '_id',
                from: 'users',
                localField: 'userId',
            },
        },
        {
            $lookup: {
                as: 'mentors',
                foreignField: '_id',
                from: 'users',
                localField: 'mentors._id',
            },
        },
        { $unwind: '$user' },
    ]).exec();
    return result;
};
