import * as Router from 'koa-router';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { connection, STATES } from 'mongoose';

import { setResponse } from '../utils';

export function batchUpdateRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/batchUpdate' });

    router.patch('/saveTable', adminGuard, async ctx => {
        if (connection.readyState !== STATES.connected) {
            setResponse(ctx, INTERNAL_SERVER_ERROR);
            return;
        }

        const {
            data: { assignments },
        } = ctx.request.body;

        if (assignments && !!assignments.length) {
            // TODO save it in db

            setResponse(ctx, OK, 'Successfully Saved!');
            return;
        }

        setResponse(ctx, BAD_REQUEST, 'Assignments are empty!');
    });

    return router;
}
