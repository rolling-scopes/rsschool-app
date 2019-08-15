import { OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { User, Course, Registry } from './../models';
import { getManager, getRepository } from 'typeorm';
import { ILogger } from './../logger';
import { adminGuard } from './guards';
import { createGetRoute } from './common';
import { setResponse } from './utils';
import { IUserSession } from '../models/session';

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

  router.get('/:id', createGetRoute(Registry, logger));

  router.post('/', async (ctx: Router.RouterContext) => {
    const { githubId } = ctx.state!.user as IUserSession;
    const { courseId, comment, type } = ctx.request.body;

    if (!githubId || !courseId || !type) {
      const errorMsg = 'Wrong payload: githubId courseId & type are required';

      handleError({ logger, errorMsg, ctx });
      return;
    }

    try {
      const [user, course] = await Promise.all([
        getRepository(User).findOne({ where: { githubId } }),
        getManager().findOne(Course, courseId),
      ]);
      const registryPayload = {
        comment,
        type,
        user,
        course,
      };
      const registry = await getManager().save(Registry, registryPayload);

      setResponse(ctx, OK, { registry });
    } catch (e) {
      handleError({ logger, errorMsg: e.message, ctx });
    }
  });

  router.put('/:id', adminGuard, async (ctx: Router.RouterContext) => {
    try {
      const id = ctx.params.id;
      const status = ctx.request.body.status;
      const registryPayload = { ...(await getManager().findOne(Registry, id)), status };
      const registry = await getManager().save(Registry, registryPayload);

      setResponse(ctx, OK, { registry });
    } catch (e) {
      handleError({ logger, errorMsg: e.message, ctx });
    }
  });

  return router;
}
