import * as Router from 'koa-router';
import { createGetRoute, createPostRoute, createDeleteRoute } from '../generic';
import { AssignmentModel, AssignmentStatus } from '../../models';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { setResponse } from '../utils';

export function assignmentRouter(adminGuard: Router.IMiddleware) {
    const router = new Router({ prefix: '/assignment' });
    router.get('/:id', createGetRoute(AssignmentModel));
    router.post('/', adminGuard, createPostRoute(AssignmentModel));
    router.patch('/', adminGuard, createPatchAssignmentRoute);
    router.delete('/:id', adminGuard, createDeleteRoute(AssignmentModel));

    return router;
}

const createPatchAssignmentRoute = async (ctx: Router.IRouterContext) => {
    const { _id, ...body } = ctx.request.body;
    try {
        body.status = AssignmentStatus.Checked;
        body.score = Math.floor(Math.random() * 2) + 99;
        const result = await AssignmentModel.findByIdAndUpdate(_id, body, { new: true });
        setResponse(ctx, OK, result);
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to update document');
    }
};
