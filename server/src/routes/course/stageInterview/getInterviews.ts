import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { StageInterviewRepository } from '../../../repositories/stageInterview';
import { ILogger } from '../../../logger';
import { setResponse } from '../../utils';

export const getInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.findMany(courseId);
  setResponse(ctx, StatusCodes.OK, result);
};
