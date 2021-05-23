import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { RepositoryService } from '../../services';
import { setResponse } from '../utils';
import { GithubService } from '../../services/github.service';

export const createRepositories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };
  const github = await GithubService.initGithub();
  const repositoryService = new RepositoryService(courseId, github, logger);
  repositoryService.createMany();
  setResponse(ctx, StatusCodes.OK);
};

export const updateRepositories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };
  const github = await GithubService.initGithub();
  const repositoryService = new RepositoryService(courseId, github, logger);
  repositoryService.updateRepositories();
  setResponse(ctx, StatusCodes.OK);
};

export const createRepository = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as { courseId: number; githubId: string };
  const github = await GithubService.initGithub();
  const repositoryService = new RepositoryService(courseId, github, logger);
  const result = await repositoryService.createSingle(githubId);
  setResponse(ctx, StatusCodes.OK, { repository: result?.repository });
};

export const inviteMentorToTeam = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as { courseId: number; githubId: string };
  const github = await GithubService.initGithub();
  const repositoryService = new RepositoryService(courseId, github, logger);
  await repositoryService.inviteMentor(githubId);
  setResponse(ctx, StatusCodes.OK);
};

export const inviteAllMentorsToTeam = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params as { courseId: number };
  const github = await GithubService.initGithub();
  const repositoryService = new RepositoryService(courseId, github, logger);
  await repositoryService.inviteAllMentors();
  setResponse(ctx, StatusCodes.OK);
};
