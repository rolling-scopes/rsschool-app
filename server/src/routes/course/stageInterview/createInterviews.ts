import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview';
import { setResponse } from '../../utils';

type BodyParams = {
  keepReserve: boolean;
  noRegistration: boolean;
};

export const createInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  try {
    const { keepReserve = true, noRegistration = false } = ctx.request.body as BodyParams;
    const repository = getCustomRepository(StageInterviewRepository);
    const result = await repository.createAutomatically(courseId, keepReserve, noRegistration);
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
