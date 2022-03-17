import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterviewRepository } from '../../../repositories/stageInterview.repository';
import { setResponse } from '../../utils';
import { sendInteviewerAssignedNotification } from '../interviews';

type RequestParams = {
  courseId: number;
  studentGithubId: string;
  githubId: string;
};

export const createInterview = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, studentGithubId, githubId: mentorGithubId } = ctx.params as RequestParams;
  const repository = getCustomRepository(StageInterviewRepository);
  const result = await repository.create(courseId, studentGithubId, mentorGithubId);

  await sendInteviewerAssignedNotification(logger, courseId, { interviewerGithubId: mentorGithubId, studentGithubId });
  setResponse(ctx, StatusCodes.OK, { id: result?.id });
};
