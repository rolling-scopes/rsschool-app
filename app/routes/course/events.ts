import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { ILogger } from '../../logger';
import { EventDocument, IApiResponse, IEventModel } from '../../models';

export function courseEventsRoute(logger: ILogger) {
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

    return router;
}
