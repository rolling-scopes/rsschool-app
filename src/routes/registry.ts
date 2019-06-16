import { OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { User, Registry } from './../models';
import { getManager } from 'typeorm';
import { ILogger } from '../logger';
import { createGetRoute } from './common';
import { setResponse } from './utils';

interface LoggingError {
  logger?: ILogger;
  errorMsg: string;
  ctx: Router.RouterContext;
}

const handleError = ({ logger, errorMsg, ctx }: LoggingError) => {
  if (logger) {
    logger.error(errorMsg);
  }

  setResponse(ctx, BAD_REQUEST, { message: errorMsg });
};

export function registryRouter(logger?: ILogger) {
  const router = new Router({ prefix: '/registry' });

  router.get('/:id', createGetRoute(User, logger));

  router.post('/', async (ctx: Router.RouterContext) => {
    const { userPayload, coursePayload } = ctx.request.body || { userPayload: '', coursePayload: '' };

    if (!userPayload || !coursePayload) {
      const errorMsg = 'Wrong payload: both userPayload & coursePayload are required';

      handleError({ logger, errorMsg, ctx });
    }

    try {
      const user = await getManager().save(User, userPayload);

      coursePayload.userId = user.id;
      coursePayload.comment = user.comment;
      coursePayload.status = 'pending';

      const registry = await getManager().save(Registry, coursePayload);

      setResponse(ctx, OK, { user, registry });
    } catch (e) {
      handleError({ logger, errorMsg: e.message, ctx });
    }
  });

  return router;
}
