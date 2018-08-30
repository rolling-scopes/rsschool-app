import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { STATES, connection } from 'mongoose';
import { AssignmentsModel } from '../../models/assignments';
import { setResponse } from './../utils';

export const postAssignments = async (ctx: Router.IRouterContext) => {
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
        const arrResult = {
            score: task.score,
            status: task.status,
            taskId: task.taskId,
        };
        setResponse(ctx, OK, { data: arrResult });
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
