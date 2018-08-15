import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
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

export const splitEventsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        let event: ITaskModel | IEventModel | undefined;
        switch (ctx.request.body.type) {
            case 'task': {
                event = new TaskModel({
                    ...ctx.request.body,
                    author: userSession._id,
                    type: ctx.request.body.taskType,
                });
                await event.save();
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
                await event.save();
                break;
            }
            default:
                return;
        }
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
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
