import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { parseAsync } from 'json2csv';
import { Course } from '../../models';
import { IUserSession } from '../../models';
import { anyCoursePowerUserGuard } from '../guards';
import { setResponse, setCsvResponse } from '../utils';
import { MentorRegistryRepository } from '../../repositories/mentorRegistry.repository';
import { sendNotification } from '../../services/notification.service';

export function registryRouter() {
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

  return router;
}
