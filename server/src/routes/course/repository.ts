import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { RepositoryService } from '../../services';
import { setResponse } from '../utils';

export const createRepositories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };
  const options = ctx.request.body as {
    includeNoMentor: boolean;
    includeNoTechnicalScreening: boolean;
  };

  const repositoryService = new RepositoryService(courseId, logger);
  const result = repositoryService.createMany({
    includeNoMentor: options.includeNoMentor,
    includeNoTechnicalScreening: false,
  });
  setResponse(ctx, OK, result);
};

export const createRepository = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as { courseId: number; githubId: string };
  const repositoryService = new RepositoryService(courseId, logger);
  const result = await repositoryService.createSingle(githubId);
  setResponse(ctx, OK, { repository: result?.repository });
};
