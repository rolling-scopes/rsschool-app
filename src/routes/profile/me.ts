import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { getProfileByGithubId } from './user';

export const getMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const githubId = ctx.state.user.githubId.toLowerCase();
  await getProfileByGithubId(ctx, githubId);
};
