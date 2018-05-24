import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';

import { ILogger } from '../../logger';
import { IApiResponse } from '../../models';
import { CourseDocument } from '../../models/course';
import { EventDocument, IEventModel } from '../../models/event';
import { getRoute, postRoute } from '../generic';

export function courseRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.get('/:id/events', async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = 500;
            return;
        }
        try {
            const events = await EventDocument.find({ courseId: ctx.params.id }).exec();
            const body: IApiResponse<IEventModel> = {
                data: events,
            };
            ctx.body = body;
            ctx.status = 200;
        } catch (err) {
            logger.error(err);
            ctx.status = 500;
        }
    });

    router.get('/:id', getRoute(CourseDocument, { useObjectId: false }, logger));
    router.post('/', postRoute(CourseDocument, logger));

    return router;
}
