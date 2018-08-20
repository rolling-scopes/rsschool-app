import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import * as XLSX from 'xlsx';
import * as koaBody from 'koa-body';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function batchUpdateRouter() {
    const router = new Router();

    router.use(koaBody({ multipart: true }));

    let res: string;

    router.post('/file', async (ctx, next) => {
        if ('POST' !== ctx.method) {
            return next();
        }
        const file = ctx.request.files.file;
        const reader = fs.createReadStream(file.path);
        const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
        reader.pipe(stream);
        stream.on('finish', () => {
            const promise = new Promise(resolve => {
                const workbook = XLSX.readFile(stream.path.toString());
                resolve(workbook.Sheets);
            });
            promise.then(result => (res = JSON.stringify(result)));
            fs.unlinkSync(stream.path);
        });
        ctx.body = ['A1', 'B1', 'C1'];
        ctx.status = OK;
    });

    return router;
}
