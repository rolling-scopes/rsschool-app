import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { IApiResponse } from '../../models';
import { CourseDocument } from '../../models/course';
import { EventDocument, IEventModel } from '../../models/event';
import { getRoute, postRoute } from '../generic';

export function courseRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.get('/:id/events', async ctx => {
        const events = await EventDocument.find({ courseId: ctx.params.id }).exec();
        const body: IApiResponse<IEventModel> = {
            data: events,
        };
        ctx.body = body;
        ctx.status = 200;
    });

    router.get('/:id', getRoute(CourseDocument, { useObjectId: false }));
    router.post('/', postRoute(CourseDocument, logger));

    return router;
}
