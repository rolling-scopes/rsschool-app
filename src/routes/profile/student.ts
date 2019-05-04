import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { User } from '../../models';
import { NOT_FOUND, OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';

export const getProfile = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  logger.info('Users');

  const query = ctx.query as { githubId: string | undefined };

  if (query === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  if (query.githubId === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const profile = await getRepository(User).findOne({ where: { githubId: query.githubId.toLowerCase() } });

  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  logger.info(profile);

  setResponse(ctx, OK, profile);
};
