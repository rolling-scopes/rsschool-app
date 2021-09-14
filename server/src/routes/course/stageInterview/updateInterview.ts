import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview.repository';
import { setResponse } from '../../utils';

export const updateInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const { interviewId } = ctx.params;
    const { githubId } = ctx.request.body;

    const repository = getCustomRepository(StageInterviewRepository);
    await repository.updateInterviewer(Number(interviewId), githubId);
    setResponse(ctx, StatusCodes.OK, {});
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
