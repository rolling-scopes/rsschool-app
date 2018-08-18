import * as Router from 'koa-router';
import * as bp from 'koa-body';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { connection, STATES } from 'mongoose';

import { setResponse } from '../utils';

import {
    baseCheckers,
    checkTable,
    isAllNeedData,
    parseXLSXTable,
    prepareForChecking,
    makeAssignments,
    defaultRequirementsForSaving,
} from '../../services/batchUpdate';

export function batchUpdateRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/batch-update' });

    router.post('/parse-table', adminGuard, bp({ multipart: true }), async ctx => {
        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const payload = parseXLSXTable(ctx.request.files.table.path);
            const tableHeaders = payload[0].map((header: string) => header.trim());

            setResponse(ctx, OK, tableHeaders);
            return;
        }

        ctx.status = BAD_REQUEST;
    });

    router.patch('/save-table', adminGuard, bp({ multipart: true }), async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }

        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const { headers, courseId, taskId } = ctx.request.body;
            const parsedHeaders = JSON.parse(headers);

            if (!isAllNeedData(parsedHeaders, defaultRequirementsForSaving)) {
                setResponse(ctx, OK, { errors: [`studentId, mentorId, score, checkDate are required`] });
                return;
            }

            // @ts-ignore
            const [tableHeaders, ...results] = parseXLSXTable(ctx.request.files.table.path);
            const errors = await checkTable(results, prepareForChecking(parsedHeaders)(baseCheckers));
            if (!!errors.length) {
                setResponse(ctx, OK, { errors });
                return;
            }

            // TODO save it in db
            // @ts-ignore
            const assignments = makeAssignments(results, courseId, taskId, JSON.parse(headers));

            setResponse(ctx, OK, 'Successfully Saved!');
            return;
        }

        ctx.status = BAD_REQUEST;
    });

    return router;
}
