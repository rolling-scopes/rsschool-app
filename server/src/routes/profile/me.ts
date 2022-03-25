import { OK, NOT_FOUND } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { IUserSession } from '../../models/session';
import { setResponse } from '../utils';

export const getMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const profile = await getRepository(User).findOne({ where: { githubId } });
  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, profile);
};
