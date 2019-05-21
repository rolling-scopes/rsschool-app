import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { Stage } from '../../models';
import { ILogger } from '../../logger';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

export const getCourseStages = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const stages = await getRepository(Stage)
    .createQueryBuilder('stage')
    .where('stage."courseId" = :courseId ', { courseId })
    .getMany();
  setResponse(ctx, OK, stages);
};

export const closeStage = (logger: ILogger) => async (ctx: Router.RouterContext) => {
    const courseId: number = ctx.params.courseId;
    const stageId: number = ctx.params.stageId;

    logger.info(stageId.toString());

    const stages = await getRepository(Stage)
        .createQueryBuilder('stage')
        .where('stage."courseId" = :courseId', { courseId })
        .getMany();

    // const stage = await getRepository(Stage).findOne({
    //     where: { id: stageId },
    //     relations: [
    //         'students',
    //         'students.mentor',
    //     ],
    // });s

    logger.info(stages || '');

    setResponse(ctx, OK, stages);
};
