import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { parseAsync } from 'json2csv';
import { Course } from '../../models';
import { anyCoursePowerUserGuard } from '../guards';
import { setCsvResponse } from '../utils';
import { MentorRegistryRepository } from '../../repositories/mentorRegistry.repository';

export function registryRouter() {
  const router = new Router<any, any>({ prefix: '/registry' });
  const repository = getCustomRepository(MentorRegistryRepository);

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
