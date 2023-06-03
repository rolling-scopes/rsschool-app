import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview.repository';
import { setResponse } from '../../utils';

export const getInterviewerStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.findByInterviewer(courseId, githubId);
  setResponse(ctx, StatusCodes.OK, result);
};
