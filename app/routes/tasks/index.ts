import * as Router from 'koa-router';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { connection, STATES } from 'mongoose';

import { setResponse } from '../utils';
import { taskService } from '../../services';

export function tasksRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/tasks' });

    router.get('/coursesRelated', adminGuard, async ctx => {
        if (connection.readyState !== STATES.connected) {
            setResponse(ctx, INTERNAL_SERVER_ERROR);
            return;
        }

        // const {
        //     data: { query },
        // } = ctx.request.body;
        // console.log(query);

        try {
            const tasks = await taskService.getCourseRelated();

            setResponse(ctx, OK, tasks);
            return;
        } catch (e) {
            setResponse(ctx, INTERNAL_SERVER_ERROR, e);
            return;
        }

        setResponse(ctx, BAD_REQUEST, 'Assignments are empty!');
    });

    return router;
}
