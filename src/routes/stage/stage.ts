import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { Stage } from '../../models';

export const shuffleMentors = (logger: ILogger) => async (ctx: Router.RouterContext) => {
    const stageId: number = ctx.params.stageId;

    const stage = await getRepository(Stage).findOne({
        where: { stageId },
        relations: [
            'students',
            'students.mentor',
        ],
    });

    logger.info(stage || '');

    setResponse(ctx, OK, stage);
};
