import * as Router from 'koa-router';
import * as bp from 'koa-body';
import * as xlsx from 'xlsx';

import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { STATES, connection } from 'mongoose';
import { setResponse } from '../utils';
import { UserModel } from '../../models';

export function batchUpdateRouter() {
    const router = new Router({ prefix: '/batch-update' });

    router.post('/parse-table', bp({ multipart: true }), async ctx => {
        if (ctx.request.files !== undefined) {
            const table = xlsx.readFile(ctx.request.files.table.path);
            const name = table.SheetNames[0];
            const payload = xlsx.utils.sheet_to_json(table.Sheets[name], { header: 1 });
            setResponse(ctx, OK, payload[0]);
            return;
        }
        setResponse(ctx, OK);
    });

    router.patch('/save-table', bp({ multipart: true }), async ctx => {
        if (connection.readyState !== STATES.connected) {
            ctx.status = INTERNAL_SERVER_ERROR;
            return;
        }
        async function isUserExists(user: any): Promise<any> {
            const result = await UserModel.findOne({ _id: user }).exec();
            return !!result;
        }

        if (ctx.request.files !== undefined && ctx.request.files.table) {
            const table = xlsx.readFile(ctx.request.files.table.path);
            const name = table.SheetNames[0];
            const payload: Array<any> = xlsx.utils.sheet_to_json(table.Sheets[name], { header: 1 });
            const taskResults = payload.slice(1);

            const errors: Array<string> = [];

            // Students duplications in Table
            const userDuplications: any = {};
            taskResults.forEach(
                async (task: any): Promise<any> => {
                    const student = task[1];
                    if (!userDuplications.hasOwnProperty(student)) {
                        userDuplications[student] = 1;
                    } else if (userDuplications.hasOwnProperty(student)) {
                        userDuplications[student] += 1;
                    }
                },
            );

            for (const student in userDuplications) {
                if (userDuplications[student] > 1) {
                    errors.push(`STUDENT ${student} IS DUPLICATED IN SCORE TABLE`);
                }
            }

            // Student in DB
            for (const task of taskResults) {
                const student = task[1];
                const isStudentExists = await isUserExists(student);
                if (!isStudentExists) {
                    errors.push(`STUDENT ${student} IS NOT EXISTS`);
                }
            }
            // for (let i = 0; i < taskResults.length; ++i) {
            //     const task = taskResults[i];
            //     const student = task[1];
            //     const isMentorExists = await isUserExists(student);
            //     if (!isMentorExists) {
            //         errors.push(`STUDENT ${student} IS NOT EXISTS`);
            //     }
            // }

            // Mentor in DB
            for (const task of taskResults) {
                const mentorName = task[2];
                let isMentor = null;

                const user = await UserModel.findOne({ _id: mentorName }).exec();
                // console.log(user);
                if (user) {
                    isMentor = user.role === 'mentor';
                }

                if (!user && !isMentor) {
                    errors.push(`MENTOR ${mentorName} IS NOT EXISTS`);
                }
            }
            // for (let i = 0; i < taskResults.length; ++i) {
            //     const task = taskResults[i];
            //     const mentorName = task[2];
            //     let isMentor = null;
            //
            //     const user = await UserModel.findOne({ _id: mentorName }).exec();
            //     console.log(user);
            //     if (user) {
            //         isMentor = user.role === 'mentor';
            //     }
            //
            //     if (!user && !isMentor) {
            //         errors.push(`MENTOR ${mentorName} IS NOT EXISTS`);
            //     }
            // }

            // Float Score
            taskResults.forEach(
                async (task: any): Promise<any> => {
                    const student = task[1];
                    const score = task[7];
                    if (!Number.isInteger(parseFloat(score))) {
                        errors.push(`SCORE FOR ${student} WITH FLOAT POINT`);
                    }
                },
            );

            setResponse(ctx, OK, { errors });
            return;
        }
        setResponse(ctx, OK);
    });
    return router;
}
