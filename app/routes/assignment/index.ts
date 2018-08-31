import * as Router from 'koa-router';
import { createGetRoute, createPostRoute, createDeleteRoute } from '../generic';
import { AssignmentModel } from '../../models';
import { createPatchAssignmentRoute } from './assignment';

export function assignmentRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/assignment' });
    router.get('/', createGetRoute(AssignmentModel));
    router.post('/', adminGuard, createPostRoute(AssignmentModel));
    router.patch('/', createPatchAssignmentRoute);
    router.delete('/:id', adminGuard, createDeleteRoute(AssignmentModel));

    return router;
}
