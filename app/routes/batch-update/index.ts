import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { setResponse } from '../utils';
import * as bp from 'koa-body';
// import * as fs from 'fs';
import * as xlsx from 'xlsx';

export function batchUpdateRouter() {
    const router = new Router({ prefix: '/batch-update' });

    router.post('/parse-table', bp({ multipart: true }), async ctx => {
        if (ctx.request.files !== undefined) {
            const table = xlsx.readFile(ctx.request.files.table.path);
            const name = table.SheetNames[0];
            const payload = xlsx.utils.sheet_to_json(table.Sheets[name], { header: 1 });
            setResponse(ctx, OK, payload);
            return;
        }
        setResponse(ctx, OK);
    });

    return router;
}
