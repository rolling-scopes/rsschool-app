import Router from '@koa/router';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { parseAsync } from 'json2csv';
import { ILogger } from '../../logger';
import { Course, Mentor, MentorRegistry, Registry } from '../../models';
import { IUserSession } from '../../models';
import { createGetRoute } from '../common';
import { adminGuard, anyCoursePowerUserGuard } from '../guards';
import { setResponse, setCsvResponse } from '../utils';
import { MentorRegistryRepository } from '../../repositories/mentorRegistry.repository';
import { sendNotification } from '../../services/notification.service';

export function registryRouter(logger?: ILogger) {
  const router = new Router<any, any>({ prefix: '/registry' });
  const repository = getCustomRepository(MentorRegistryRepository);

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

  router.post('/mentor', async (ctx: Router.RouterContext) => {
    if (!ctx.state.user) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }
    const { githubId, id } = ctx.state.user as IUserSession;
    await repository.register(githubId, ctx.request.body);
    await sendNotification({
      notificationId: 'mentorRegistrationApproval:submit',
      userId: id,
    });
    setResponse(ctx, OK);
  });

  router.get('/mentor', async (ctx: Router.RouterContext) => {
    if (!ctx.state.user) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const { id: userId } = ctx.state.user as IUserSession;

    const mentorRegistry = await getRepository(MentorRegistry).findOne({ where: { userId } });
    if (mentorRegistry == null) {
      setResponse(ctx, NOT_FOUND);
      return;
    }

    const result = {
      maxStudentsLimit: mentorRegistry.maxStudentsLimit,
      preferedStudentsLocation: mentorRegistry.preferedStudentsLocation,
      preselectedCourses: mentorRegistry.preselectedCourses.map(c => Number(c)),
      preferredCourses: mentorRegistry.preferedCourses.map(c => Number(c)),
    };
    setResponse(ctx, OK, result);
  });

  router.get('/mentors/csv', anyCoursePowerUserGuard, async (ctx: Router.RouterContext) => {
    const data = await repository.findAll();
    const courses = await getRepository(Course).find({ select: ['id', 'name'] });

    const csv = await parseAsync(
      data.map(d => ({
        ...d,
        preferedCourses: d.preferedCourses.map(id => courses.find(c => Number(id) === c.id)?.name).filter(Boolean),
        preselectedCourses: d.preselectedCourses
          .map(id => courses.find(c => Number(id) === c.id)?.name)
          .filter(Boolean),
        courses: d.courses?.map(id => courses.find(c => Number(id) === c.id)?.name).filter(Boolean),
      })),
    );
    setCsvResponse(ctx, OK, csv, 'mentors');
  });

  router.get('/:id', adminGuard, createGetRoute(Registry, logger));

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
