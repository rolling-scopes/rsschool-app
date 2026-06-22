import Router from '@koa/router';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { parseAsync } from 'json2csv';
import { ILogger } from '../../logger';
import { Course, Mentor, Registry, Student, User } from '../../models';
import { IUserSession } from '../../models';
import { adminGuard, anyCoursePowerUserGuard } from '../guards';
import { setResponse, setCsvResponse } from '../utils';
import { MentorRegistryRepository } from '../../repositories/mentorRegistry.repository';
import { sendNotification } from '../../services/notification.service';

export function registryRouter(logger?: ILogger) {
  const router = new Router<any, any>({ prefix: '/registry' });
  const repository = getCustomRepository(MentorRegistryRepository);

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

  router.post('/', async (ctx: Router.RouterContext) => {
    if (!ctx.state.user) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const { githubId, id: userId } = ctx.state.user as IUserSession;
    const { courseId, type, maxStudentsLimit, experienceInYears } = ctx.request.body;

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
        getRepository(Course).findOneBy({ id: Number(courseId) }),
        getRepository(Registry).findOne({ where: { userId, courseId: Number(courseId) } }),
      ])) as [User, Course, Registry];

      if (existingRegistry && existingRegistry.userId === userId) {
        setResponse(ctx, OK, existingRegistry);
        return;
      }

      let registryPayload: Partial<Registry> = {
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

      const registry = await getRepository(Registry).save(registryPayload);
      setResponse(ctx, OK, registry);
    } catch (e) {
      handleError({ logger, errorMsg: (e as Error).message, ctx });
    }
  });

  return router;
}

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
