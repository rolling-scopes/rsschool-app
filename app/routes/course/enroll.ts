import { ACCEPTED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
import {
    CourseModel,
    CourseStudentModel,
    ICourseStudentModel,
    ICouseUser,
    CourseMentorModel,
    ICourseMentorModel,
    IUserSession,
    saveCourseEnrollFeedAction,
} from '../../models';
import { userService } from '../../services';

export const courseEnrollRoute = async (ctx: Router.IRouterContext) => {
    try {
        const userSession: IUserSession = ctx.state.user!;
        if (userSession === null) {
            ctx.status = UNAUTHORIZED;
            return;
        }

        const { id: courseId } = ctx.params;
        const [course, user] = await Promise.all([
            CourseModel.findById(courseId).exec(),
            userService.getUserById(userSession._id),
        ]);

        if (course === null || user === null) {
            ctx.status = NOT_FOUND;
            return;
        }

        const userCourse = user.participations.find(p => p.courseId === courseId);
        if (userCourse != null) {
            ctx.status = ACCEPTED;
            return;
        }

        const data: ICouseUser = {
            city: user.profile.city as string,
            courseId,
            isActive: true,
            userId: user._id,
        };

        let result: ICourseStudentModel | ICourseMentorModel | undefined;

        switch (user.role) {
            case 'student': {
                result = await new CourseStudentModel(data).save();
                break;
            }
            case 'mentor': {
                result = await new CourseMentorModel(data).save();
                break;
            }
            default:
                result = undefined;
        }

        await saveCourseEnrollFeedAction(user._id, courseId, {
            text: `Enrolled as ${user.role}`,
        });

        if (result != null) {
            user.participations.push({
                _id: result._id,
                courseId,
                isActive: true,
                role: user.role,
            });
            await user.save();
        }
        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
