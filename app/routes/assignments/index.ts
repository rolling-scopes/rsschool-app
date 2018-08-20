import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { IApiResponse } from '../../models';
import { AssignmentsModel, IAssignmentsModel } from '../../models/assignments';

export function tasksRouter() {
    const router = new Router({ prefix: '/student-tasks' });

    router.post('/', async ctx => {
        if (ctx.request.body.userId) {
            if (connection.readyState !== STATES.connected) {
                ctx.status = INTERNAL_SERVER_ERROR;
                return;
            }
            try {
                const tasks = await AssignmentsModel.find({
                    studentId: ctx.request.body.userId,
                }).exec();
                const body: IApiResponse<IAssignmentsModel> = {
                    data: tasks,
                };
                ctx.body = body;
                ctx.status = OK;
            } catch (err) {
                ctx.logger.error(err);
                ctx.status = INTERNAL_SERVER_ERROR;
            }
        }
        if (!ctx.request.body.userId) {
            if (connection.readyState !== STATES.connected) {
                ctx.status = INTERNAL_SERVER_ERROR;
                return;
            }
            try {
                const arrTask = await AssignmentsModel.find({
                    studentId: ctx.request.body.idUser,
                    taskId: ctx.request.body.idTask,
                }).exec();
                const task = arrTask[0];
                task.studentComment = ctx.request.body.studentComment;
                task.assigmentRepo = ctx.request.body.link;
                task.score = Math.floor(Math.random() * 101);
                task.score === 100 ? (task.status = 'success') : (task.status = 'warning');
                await task.save();
                const body: IApiResponse<IAssignmentsModel> = {
                    data: task,
                };
                ctx.body = body;
                ctx.status = OK;
            } catch (err) {
                ctx.logger.error(err);
                ctx.status = INTERNAL_SERVER_ERROR;
            }
        }
    });

    return router;
}
