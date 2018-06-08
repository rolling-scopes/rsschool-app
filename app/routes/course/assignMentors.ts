import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { assignMentorsByCity, assignMentorsByPreference } from '../../rules/assignMentors';

export const courseAssignMentorsRoute = async (ctx: Router.IRouterContext) => {
    try {
        const { id: courseId } = ctx.params;
        await assignMentorsByPreference(courseId, ctx.logger);
        await assignMentorsByCity(courseId, ctx.logger);

        ctx.status = OK;
    } catch (err) {
        ctx.logger.error(err);
        ctx.status = INTERNAL_SERVER_ERROR;
    }
};
