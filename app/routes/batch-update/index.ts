import * as Router from 'koa-router';
import * as bp from 'koa-body';
// import * as fs from 'fs';
import { INTERNAL_SERVER_ERROR, OK, BAD_REQUEST } from 'http-status-codes';
import { STATES, connection } from 'mongoose';

import { setResponse } from '../utils';

import {
    parseXLSXTable,
    checkJSCOREInterviewTable,
    makeAssignmentsForJSCoreInterview,
    JSCOREInterviewColumns,
} from '../../services/batchUpdate';

export function batchUpdateRouter() {
    const router = new Router({ prefix: '/batch-update' });

    router.post('/parse-table', bp({ multipart: true }), async ctx => {
        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const payload = parseXLSXTable(ctx.request.files.table.path);
            const tableHeaders = payload[0].map((header: string) => header.trim());

            setResponse(ctx, OK, tableHeaders);
            return;
        }

        ctx.status = BAD_REQUEST;
    });

    router.patch('/save-table', bp({ multipart: true }), async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }

        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const { headers: headersString, courseId, taskId } = ctx.request.body;
            const headers = headersString.split('<|>');
            // {'GitHub Студента': 'studentId'}
            if (
                !headers.includes(JSCOREInterviewColumns.studentId) ||
                !headers.includes(JSCOREInterviewColumns.mentorId)
            ) {
                setResponse(ctx, OK, { errors: [`Student's and Mentor's GitHub are required columns`] });
                return;
            }

            const payload = parseXLSXTable(ctx.request.files.table.path);
            const taskResults = payload.slice(1);

            // TODO
            const errors = await checkJSCOREInterviewTable(taskResults);
            if (errors.length) {
                setResponse(ctx, OK, { errors });
                return;
            }

            // fs.writeFileSync(__dirname + '/test.md', assignments[0].mentorComment, { encoding: 'utf-8' });
            makeAssignmentsForJSCoreInterview(payload, headers, courseId, taskId);

            setResponse(ctx, OK, 'Successfully Saved!');
            return;
        }

        ctx.status = BAD_REQUEST;
    });

    return router;
}
