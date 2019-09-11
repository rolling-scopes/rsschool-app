import Router from 'koa-router';
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

export const postCourseStages = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const inputData: { name: string }[] = ctx.request.body;
  const result = await getRepository(Stage).save(
    inputData.map(d => ({
      name: d.name,
      courseId,
    })),
  );
  setResponse(ctx, OK, result);
};
