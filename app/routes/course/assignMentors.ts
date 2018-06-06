import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { assignMentorsByCity, assignMentorsByPreference } from '../../rules/assignMentors';

export function courseAssignStudentsRoute(logger: ILogger) {
    const router = new Router({ prefix: '/course' });

    router.post('/:courseId/mentors/assign', async ctx => {
        try {
            const { courseId } = ctx.params;
            await assignMentorsByPreference(courseId, logger);
            await assignMentorsByCity(courseId, logger);

            ctx.status = OK;
        } catch (err) {
            logger.error(err);
            ctx.status = INTERNAL_SERVER_ERROR;
        }
    });

    return router;
}
