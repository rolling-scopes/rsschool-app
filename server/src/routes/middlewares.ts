import Router from 'koa-router';
import { BAD_REQUEST } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { uniq } from 'lodash';
import { setResponse } from './utils';
import { IUserSession, CourseUser, CourseRoles, CourseRole } from '../models';

export const courseMiddleware = async (ctx: Router.RouterContext, next: any) => {
  if (!ctx.params.courseId) {
    await next();
    return;
  }
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Course Id]');
    return;
  }
  ctx.params.courseId = courseId;
  const courseTaskId = Number(ctx.params.courseTaskId);
  if (!isNaN(courseTaskId)) {
    ctx.params.courseTaskId = courseTaskId;
  }
  await next();
};

export const userRolesMiddleware = async (ctx: Router.RouterContext, next: any) => {
  const user = ctx.state?.user as IUserSession;
  if (user == null) {
    await next();
    return;
  }

  const items = await getRepository(CourseUser)
    .createQueryBuilder('courseUser')
    .where('"courseUser"."userId" = :userId', { userId: user.id })
    .getMany();

  const courseRoles: CourseRoles = items.reduce(
    (acc, item) => ({
      ...acc,
      [item.courseId]: uniq(
        (user.coursesRoles?.[item.courseId] ?? ([] as CourseRole[]))
          .concat(item.isJuryActivist ? ['juryActivist'] : [])
          .concat(item.isManager ? ['manager'] : [])
          .concat(item.isSupervisor ? ['supervisor'] : []),
      ),
    }),
    {},
  );
  user.coursesRoles = courseRoles;
  await next();
};
