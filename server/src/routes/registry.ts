import { OK, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { User, Student, Course, Registry, Mentor } from './../models';
import { getManager, getRepository } from 'typeorm';
import { ILogger } from './../logger';
import { adminGuard } from './guards';
import { createGetRoute } from './common';
import { setResponse } from './utils';
import { IUserSession } from './../models/session';
import { updateSession } from '../session';

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

  router.get('/', adminGuard, async (ctx: Router.RouterContext) => {
    const { type, courseId } = ctx.query;
    const registries = await getRepository(Registry).find({
      skip: 0,
      take: 1000,
      order: { id: 'ASC' },
      relations: ['user', 'course'],
      where: [{ type: type || 'mentor', course: { id: courseId } }],
    });

    if (registries === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }

    setResponse(ctx, OK, registries);
  });

  router.get('/:id', adminGuard, createGetRoute(Registry, logger));

  router.post('/', async (ctx: Router.RouterContext) => {
    const { githubId, id: userId } = ctx.state!.user as IUserSession;
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
        getRepository(Course).findOne(Number(courseId)),
        getRepository(Registry).findOne({ where: { userId, courseId: Number(courseId) } }),
      ])) as [User, Course, Registry];

      if (existingRegistry && existingRegistry.userId === userId) {
        setResponse(ctx, OK, existingRegistry);
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
          await getRepository(Student).save({ userId: user!.id, courseId: course!.id, startDate: new Date() });
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

      // update session
      if (registryPayload.status === 'approved') {
        updateSession(ctx, { roles: { [courseId]: type } });
      }

      const registry = await getRepository(Registry).save(registryPayload);
      setResponse(ctx, OK, registry);
    } catch (e) {
      handleError({ logger, errorMsg: e.message, ctx });
    }
  });

  router.put('/', adminGuard, async (ctx: Router.RouterContext) => {
    const ids = ctx.request.body.ids as number[];
    const status = ctx.request.body.status;

    const result = [];

    for await (const id of ids) {
      const oldRegistry = await getRepository(Registry).findOne({ where: { id: Number(id) }, relations: ['course'] });
      if (!oldRegistry) {
        continue;
      }
      const registryPayload = { ...oldRegistry, status };
      const { userId, course, attributes } = registryPayload;
      await getRepository(Registry).save(registryPayload);

      if (status === 'approved') {
        const existingMentor = await getRepository(Mentor).findOne({ where: { userId, courseId: course.id } });
        if (existingMentor == null) {
          const newMentor = await getRepository(Mentor).save({
            userId,
            courseId: course.id,
            maxStudentsLimit: attributes.maxStudentsLimit,
          });
          result.push(newMentor);
        } else {
          result.push(existingMentor);
        }
      }
    }

    setResponse(ctx, OK, { registries: result });
  });

  return router;
}
