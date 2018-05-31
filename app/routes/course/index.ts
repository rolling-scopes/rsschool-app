import { ACCEPTED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { ILogger } from '../../logger';
import { CourseDocument, EventDocument, IApiResponse, IEventModel, IUserSession, UserDocument } from '../../models';
import { getRoute, postRoute } from '../generic';

export function courseRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.get('/:id/events', async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }
        try {
            const events = await EventDocument.find({ courseId: ctx.params.id }).exec();
            const body: IApiResponse<IEventModel> = {
                data: events,
            };
            ctx.body = body;
            ctx.status = OK;
        } catch (err) {
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    });

    router.get('/:id', getRoute(CourseDocument, { useObjectId: false }, logger));
    router.post('/', postRoute(CourseDocument, logger));

    router.post('/:id/enroll', async ctx => {
        try {
            const userSession: IUserSession = ctx.state.user;
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

            const userCourse = user.courses.find(c => c.id === courseId);
            if (userCourse != null) {
                ctx.status = ACCEPTED;
                return;
            }

            user.courses.push({
                excludeReason: undefined,
                id: courseId,
                isActive: true,
                mates: [],
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
