import * as Router from 'koa-router';
import * as bp from 'koa-body';

import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { STATES, connection } from 'mongoose';
import { setResponse } from '../utils';
// import * as fs from 'fs';
// import { UserModel } from '../../models';
import {
    parseXLSXTable,
    checkJSCOREInterviewTable,
    makeAssignmentsForJSCoreInterview,
} from '../../services/batchUpdate';
// import { isUserExists, getUserById, isUserIsMentor } from '../../services/userService';

export function batchUpdateRouter() {
    const router = new Router({ prefix: '/batch-update' });

    router.post('/parse-table', bp({ multipart: true }), async ctx => {
        if (ctx.request.files !== undefined) {
            const payload = parseXLSXTable(ctx.request.files.table.path);
            const tableHeaders = payload[0];

            setResponse(ctx, OK, tableHeaders);
            return;
        }
        setResponse(ctx, OK);
    });

    router.patch('/save-table', bp({ multipart: true }), async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }

        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const payload = parseXLSXTable(ctx.request.files.table.path);
            const taskResults = payload.slice(1);
            const errors = await checkJSCOREInterviewTable(taskResults);

            // console.log('ERRORS', errors);
            const { headers, courseId, taskId } = ctx.request.body;
            // console.log(ctx.request.body);

            // fs.writeFileSync(__dirname + '/test.md', assignments[0].mentorComment, { encoding: 'utf-8' });
            makeAssignmentsForJSCoreInterview(
                payload,
                headers.split('<|>').map((h: string) => h.trim()),
                courseId,
                taskId,
            );

            if (!errors.length) {
                setResponse(ctx, OK, 'Successfully Saved!');
            } else {
                setResponse(ctx, OK, { errors });
            }
            return;
        }
        setResponse(ctx, OK);
    });

    return router;
}
