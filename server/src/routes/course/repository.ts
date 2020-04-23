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
  repositoryService.createMany({
    includeNoMentor: options.includeNoMentor,
    includeNoTechnicalScreening: options.includeNoTechnicalScreening,
  });
  setResponse(ctx, OK);
};

export const updateRepositories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };

  const repositoryService = new RepositoryService(courseId, logger);
  repositoryService.enableGhPages();
  setResponse(ctx, OK);
};

export const createRepository = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as { courseId: number; githubId: string };
  const repositoryService = new RepositoryService(courseId, logger);
  const result = await repositoryService.createSingle(githubId);
  setResponse(ctx, OK, { repository: result?.repository });
};
