import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { IUserSession } from '../../models';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { uploadFileByGithubId } from '../../services/aws.service';

export const uploadFile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;
  const { key = '' } = ctx.query as { key: string | undefined };
  const body = ctx.request.body;
  const response = await uploadFileByGithubId(githubId, key, body);
  setResponse(ctx, OK, response);
};
