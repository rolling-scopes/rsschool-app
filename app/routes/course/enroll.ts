import { ACCEPTED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import {
    CourseDocument,
    CourseStudentDocument,
    IUserSession,
    UserDocument,
    saveCourseEnrollFeedAction,
} from '../../models';

export function courseEnrollRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.post('/:id/enroll', async ctx => {
        try {
            const userSession: IUserSession = ctx.state.user!;
            if (userSession === null) {
                ctx.status = UNAUTHORIZED;
                return;
            }

            const courseId = ctx.params.id;
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
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    });

    return router;
}
