import Router = require('koa-router');
import { CourseMentorModel, CourseStudentModel } from '../../models';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';

export const updateCourseStudentRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id } = ctx.params;
        const { userId, mentors } = ctx.request.body;
        const mentorsIds = mentors.map(({ _id }: { _id: string }) => _id);
        const findIntersection = await CourseStudentModel.aggregate([
            {
                $match: {
                    courseId: id,
                    userId,
                },
            },
            {
                $addFields: {
                    common: { $setIntersection: ['$mentors', mentors] },
                },
            },
            {
                $project: {
                    common: 1,
                    mentors: 1,
                    remove: { $setDifference: ['$mentors', '$common'] },
                },
            },
        ]).exec();
        const { remove } = findIntersection[0];
        const removeMentorsIds = remove.map(({ _id }: { _id: string }) => _id);
        await CourseStudentModel.update(
            {
                courseId: id,
                userId,
            },
            {
                $set: {
                    mentors,
                },
            },
        );
        await CourseMentorModel.updateMany(
            {
                courseId: id,
                userId: { $in: mentorsIds },
            },
            {
                $addToSet: {
                    mentees: { _id: userId },
                },
            },
        ).exec();
        await CourseMentorModel.updateMany(
            {
                courseId: id,
                userId: { $in: removeMentorsIds },
            },
            {
                $pull: {
                    mentees: { _id: userId },
                },
            },
        ).exec();
        ctx.status = OK;
    } catch (e) {
        ctx.logger.error(e);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
