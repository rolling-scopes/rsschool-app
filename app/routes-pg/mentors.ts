import * as Router from 'koa-router';
import { getManager } from 'typeorm';
import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../routes/utils';
import { Mentor, User } from '../models-pg';
import { ILogger } from '../logger';
import { createGetAllRoute } from './common';

export function adminMentorsRouter(logger: ILogger) {
  const router = new Router({ prefix: '/v2/:courseId/mentors' });

  router.get('/', createGetAllRoute(Mentor, { take: 20, skip: 0 }, logger, ['user']));

  router.post('/', async (ctx: Router.RouterContext) => {
    const courseId = Number(ctx.params.courseId);

    if (isNaN(courseId)) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const data: { githubId: string; maxStudentsLimit: number }[] = ctx.request.body;

    const userRepository = getManager().getRepository(User);
    const mentorRepository = getManager().getRepository(Mentor);

    if (data === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }

    for await (const item of data) {
      console.time(item.githubId);

      const user = await userRepository.findOne({ where: { githubId: item.githubId } });
      if (user == null) {
        continue;
      }

      const exists = (await mentorRepository.count({ where: { user } })) > 0;
      if (exists) {
        continue;
      }

      const mentor = {
        user,
        course: courseId,
        maxStudentsLimit: item.maxStudentsLimit,
      };
      await mentorRepository.save(mentor);

      console.timeEnd(item.githubId);
    }

    setResponse(ctx, OK, data);
  });
  return router;
}
