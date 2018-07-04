import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { CourseStudentModel, ICourseStudent } from '../../models';
import { setResponse } from '../utils';

export const courseStudentsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
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
        setResponse(ctx, OK, result);
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
