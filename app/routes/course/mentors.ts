import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { CourseMentorModel, CourseStudentModel, ICourseMentor, ICourseStudent } from '../../models';
import { setResponse } from '../utils';

export const courseMentorsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const result: ICourseMentor = await CourseMentorModel.aggregate([
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
                    as: 'mentees',
                    foreignField: '_id',
                    from: 'users',
                    localField: 'mentees._id',
                },
            },
            { $unwind: '$user' },
        ]).exec();
        setResponse(ctx, OK, result);
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};

export const courseMentorStudentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        const userId = ctx.state.user!._id;
        const result: ICourseStudent = await CourseStudentModel.aggregate([
            {
                $match: {
                    $expr: { $in: [{ _id: userId }, '$mentors'] },
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
        setResponse(ctx, OK, result);
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
