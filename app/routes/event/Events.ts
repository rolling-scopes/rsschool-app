import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../utils';

import {
    ITaskModel,
    IEventModel,
    TaskModel,
    EventModel,
    IUserSession,
    AssignmentModel,
    AssignmentStatus,
    ICourseStudent,
    CourseStudentModel,
} from '../../models';

export const createPostEventsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        let event: ITaskModel | IEventModel | undefined;
        switch (ctx.request.body.type) {
            case 'task': {
                event = new TaskModel({
                    ...ctx.request.body,
                    author: userSession._id,
                });
                ctx.body = {};
                ctx.body = await event.save();
                ctx.status = OK;
                const students: any = await getStudentsByCourseId(ctx.request.body.courseId);
                for (const index in students) {
                    if (students[index]) {
                        const assignment = new AssignmentModel({
                            assignmentRepo: event.urlToDescription,
                            checkDate: 0,
                            completeDate: 0,
                            courseId: ctx.request.body.courseId,
                            deadlineDate: event.endDateTime,
                            mentorComment: '',
                            mentorId: students[index].mentors.githubId,
                            score: 0,
                            status: AssignmentStatus.Assigned,
                            studentComment: '',
                            studentId: students[index].user.profile.githubId,
                            taskId: event.id,
                        });
                        await assignment.save();
                    }
                }
                break;
            }
            case 'session': {
                event = new EventModel(ctx.request.body);
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

export const createDeleteEventsRoute = async (ctx: Router.IRouterContext) => {
    const { id } = ctx.params;

    try {
        const eventsQuery = await EventModel.findByIdAndRemove(id);
        const query = eventsQuery === null ? await TaskModel.findByIdAndRemove(id) : eventsQuery;

        if (query === null) {
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

    try {
        const taskResult = await TaskModel.findByIdAndUpdate(_id, body, { new: true });
        const result = taskResult === null ? await EventModel.findByIdAndUpdate(_id, body, { new: true }) : taskResult;

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
    const result: ICourseStudent = await CourseStudentModel.aggregate([
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
