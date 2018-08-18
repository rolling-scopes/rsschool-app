import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';
import { connection, STATES, Types } from 'mongoose';
import * as Router from 'koa-router';
import { setResponse } from '../utils';
import {
    IApiResponse,
    IEventModel,
    ITaskModel,
    EventModel,
    TaskModel,
    IUserSession,
    AssignmentModel,
    AssignmentStatus,
    ICourseStudent,
    CourseStudentModel,
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
                for (const index in students) {
                    if (students[index]) {
                        const assignment = new AssignmentModel({
                            assignmentRepo: task.urlToDescription,
                            checkDate: 0,
                            completeDate: 0,
                            courseId: ctx.request.body.courseId,
                            deadlineDate: task.endDateTime,
                            mentorComment: '',
                            mentorId: students[index].mentors.githubId,
                            score: 0,
                            status: AssignmentStatus.Assigned,
                            studentComment: '',
                            studentId: students[index].user.profile.githubId,
                            taskId: task.id,
                            title: task.title,
                        });
                        await assignment.save();
                    }
                }
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
    const { id } = ctx.params;
    try {
        const queryEvent = await EventModel.findByIdAndRemove(id);
        if (queryEvent === null) {
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
    const { _id, ...body } = ctx.request.body;

    try {
        const result =
            (await EventModel.findByIdAndUpdate(_id, body, { new: true })) ||
            (await TaskModel.findByIdAndUpdate(_id, body, { new: true }));

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
