import * as Router from 'koa-router';
import { userService } from '../../services';
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

  try {
    const user = await userService.getFullUserByGithubId(query.githubId.toLowerCase());

    if (user === undefined) {
            setResponse(ctx, NOT_FOUND);
            return;
        }

    logger.info(user);

    setResponse(ctx, OK, user);
  } catch (e) {
      logger.info(e);
  }
};
