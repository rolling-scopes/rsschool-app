import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { StageInterviewFeedbackRepository } from '../../../repositories/stageInterviewFeedback.repository';
import { setResponse } from '../../utils';

export const getFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { interviewId } = ctx.params;
  const mentorGithubId = (ctx.state!.user as IUserSession).githubId;
  try {
    const repository = getCustomRepository(StageInterviewFeedbackRepository);
    const feedback = await repository.find(Number(interviewId), mentorGithubId);
    const result = JSON.parse(feedback?.json ?? '{}');
    setResponse(ctx, StatusCodes.OK, result);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
