import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { ILogger } from '../../logger';
import { CourseDocument, IApiResponse, ICourseModel } from '../../models';

export function coursesRoute(logger: ILogger) {
    const router = new Router({ prefix: '/courses' });

    router.get('/', async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }
        try {
            const courses = await CourseDocument.find({}).exec();
            const body: IApiResponse<ICourseModel> = {
                data: courses,
            };
            ctx.body = body;
            ctx.status = OK;
        } catch (err) {
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    });

    return router;
}
