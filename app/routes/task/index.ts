import * as Router from 'koa-router';
import { TaskModel } from '../../models/event';
import { createGetRoute, createPatchRoute } from '../generic';
import { postTaskAndGenerateAssignments, deleteTaskAndAssignments } from './utils';

export function taskRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/task' });

    router.get('/:id', createGetRoute(TaskModel));
    router.post('/', adminGuard, postTaskAndGenerateAssignments(TaskModel));
    router.patch('/', adminGuard, createPatchRoute(TaskModel));
    router.delete('/:id', adminGuard, deleteTaskAndAssignments(TaskModel));

    return router;
}
