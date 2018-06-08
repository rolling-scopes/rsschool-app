import { ACCEPTED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
import {
    CourseDocument,
    CourseStudentDocument,
    IUserSession,
    saveCourseEnrollFeedAction,
    UserDocument,
} from '../../models';

export const courseEnrollRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        if (userSession === null) {
            ctx.status = UNAUTHORIZED;
            return;
        }

        const { id: courseId } = ctx.params;
        const course = await CourseDocument.findById(courseId);
        if (course === null) {
            ctx.status = NOT_FOUND;
            return;
        }

        const user = await UserDocument.findById(userSession._id);
        if (user === null) {
            ctx.status = NOT_FOUND;
            return;
        }

        const userCourse = user.participations.find(p => p.courseId === courseId);
        if (userCourse != null) {
            ctx.status = ACCEPTED;
            return;
        }

        const participation = new CourseStudentDocument({
            courseId,
            isActive: true,
            role: user.role,
            userId: user._id,
        });

        const [result] = await Promise.all([
            participation.save(),
            saveCourseEnrollFeedAction(user._id, courseId, {
                text: 'Enrolled',
            }),
        ]);

        user.participations.push({
            _id: result._id,
            courseId,
            isActive: true,
            role: user.role,
        });
        await user.save();
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
