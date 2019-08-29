import { OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { User, Student, Course, Registry, Mentor } from './../models';
import { getManager, getRepository } from 'typeorm';
import { ILogger } from './../logger';
import { adminGuard } from './guards';
import { createGetRoute } from './common';
import { setResponse } from './utils';
import { IUserSession } from './../models/session';

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

  router.get('/:id', adminGuard, createGetRoute(Registry, logger));

  router.post('/', async (ctx: Router.RouterContext) => {
    const { githubId, id } = ctx.state!.user as IUserSession;
    const { courseId, comment, type, maxStudentsLimit, experienceInYears } = ctx.request.body;

    if (!githubId || !courseId || !type) {
      const errorMsg = 'Wrong payload: githubId courseId & type are required';

      handleError({ logger, errorMsg, ctx });
      return;
    }

    if (type === 'mentor' && (isNaN(maxStudentsLimit) || maxStudentsLimit < 2)) {
      const errorMsg = 'Incorrect maxStudentsLimit';
      handleError({ logger, errorMsg, ctx });
      return;
    }

    try {
      const [user, course, existingRegistry] = (await Promise.all([
        getRepository(User).findOne({ where: { githubId }, relations: ['mentors', 'students'] }),
        getRepository(Course).findOne(courseId),
        getRepository(Registry).findOne({ where: { userId: id, courseId: Number(courseId) } }),
      ])) as [User, Course, Registry];

      if (existingRegistry && existingRegistry.userId === id) {
        setResponse(ctx, OK, { existingRegistry });
        return;
      }

      let registryPayload: Partial<Registry> = {
        comment,
        type,
        user,
        course,
        status: 'pending',
      };

      if (type === 'student') {
        registryPayload.status = 'approved';
        if ((user.students || []).every(s => s.courseId !== courseId)) {
          await getRepository(Student).save({ userId: user!.id, courseId: course!.id });
        }
      } else if (type === 'mentor') {
        registryPayload = {
          ...registryPayload,
          attributes: {
            maxStudentsLimit,
            experienceInYears,
          },
        };
        if ((user!.mentors || [])!.length > 0) {
          registryPayload.status = 'approved';
          await getRepository(Mentor).save({ userId: user!.id, courseId: course!.id, maxStudentsLimit });
        }
      }

      const registry = await getRepository(Registry).save(registryPayload);
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
