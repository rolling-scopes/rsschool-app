import Router from '@koa/router';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { parseAsync } from 'json2csv';
import { ILogger } from '../../logger';
import { Course, Mentor, MentorRegistry, Registry, Student, User } from '../../models';
import { IUserSession } from '../../models';
import { getUserByGithubId } from '../../services/user.service';
import { updateSession } from '../../session';
import { createGetRoute } from '../common';
import { adminGuard, anyCourseManagerGuard } from '../guards';
import { setResponse, setCsvResponse } from '../utils';
import { notificationService } from '../../services';
import { MentorRegistryRepository } from '../../repositories/mentorRegistry';

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

  router.post('/mentor', async (ctx: Router.RouterContext) => {
    const { id: userId } = ctx.state!.user as IUserSession;

    const {
      comment,
      maxStudentsLimit,
      technicalMentoring,
      preferedStudentsLocation,
      preferedCourses,
      englishMentoring,
    } = ctx.request.body;

    const mentorData: Partial<MentorRegistry> = {
      comment,
      maxStudentsLimit,
      preferedStudentsLocation,
      englishMentoring,
      preferedCourses,
      technicalMentoring,
    };

    const mentorRegistry = await getRepository(MentorRegistry).findOne({ where: { userId } });
    if (mentorRegistry == null) {
      await getRepository(MentorRegistry).insert({ userId, ...mentorData });
    } else {
      await getRepository(MentorRegistry).update(mentorRegistry.id, mentorData);
    }

    setResponse(ctx, OK);
  });

  router.put('/mentor/:githubId', anyCourseManagerGuard, async (ctx: Router.RouterContext) => {
    const githubId = ctx.params.githubId;

    const { preselectedCourses } = ctx.request.body;

    const mentorData: Partial<MentorRegistry> = { preselectedCourses };
    const user = await getUserByGithubId(githubId);
    if (user == null) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }
    await getRepository(MentorRegistry).update({ userId: user.id }, mentorData);
    setResponse(ctx, OK);
    const confirmationText = await notificationService.renderMentorConfirmationText(preselectedCourses);
    await notificationService.sendNotification([githubId], confirmationText, true);
  });

  router.get('/mentor', async (ctx: Router.RouterContext) => {
    const { id: userId } = ctx.state!.user as IUserSession;

    const mentorRegistry = await getRepository(MentorRegistry).findOne({ where: { userId } });
    if (mentorRegistry == null) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const result = {
      maxStudentsLimit: mentorRegistry.maxStudentsLimit,
      preferedStudentsLocation: mentorRegistry.preferedStudentsLocation,
      preselectedCourses: mentorRegistry.preselectedCourses.map(c => Number(c)),
    };
    setResponse(ctx, OK, result);
  });

  router.get('/mentors', anyCourseManagerGuard, async (ctx: Router.RouterContext) => {
    const state = ctx.state!.user as IUserSession;
    let mentorRegistries: Array<any> = [];
    const repository = getCustomRepository(MentorRegistryRepository);

    if (state.isAdmin) {
      mentorRegistries = await repository.findAllMentorRegistries();
    } else {
      const coursesRoles = state.coursesRoles;
      if (coursesRoles) {
        const coursesIds: Array<number> = [];
        for (const [key, value] of Object.entries(coursesRoles)) {
          value?.map(role => {
            role === 'manager' && coursesIds.push(Number(key));
          });
        }
        mentorRegistries = await repository.findMentorRegistriesByCoursesIds(coursesIds);
      }
    }
    setResponse(ctx, OK, mentorRegistries);
  });

  router.get('/mentors/csv', anyCourseManagerGuard, async (ctx: Router.RouterContext) => {
    const data = await getCustomRepository(MentorRegistryRepository).findAllMentorRegistries();
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
