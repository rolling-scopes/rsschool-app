import * as Router from 'koa-router';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { setResponse, toArray } from '../utils';
import { assignmentsService } from '../../services';

export const patchAssignmentRoute = async (ctx: Router.IRouterContext) => {
    const {
        data: { forSave, opts },
    } = ctx.request.body;

    try {
        const result = await assignmentsService.batchUpdate(toArray(forSave), opts);

        setResponse(ctx, OK, result);
    } catch (e) {
        ctx.status = INTERNAL_SERVER_ERROR;
        ctx.logger.error(e, 'Failed to update document');
    }
};
