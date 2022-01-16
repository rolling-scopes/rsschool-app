import Router from '@koa/router';
import { BAD_REQUEST } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { uniq } from 'lodash';
import { Next } from 'koa';
import { setResponse } from './utils';
import { IUserSession, CourseUser, CourseRoles, CourseRole, CourseTask } from '../models';

export const courseMiddleware = async (ctx: Router.RouterContext, next: Next) => {
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

export const userRolesMiddleware = async (ctx: Router.RouterContext, next: Next) => {
  const user = ctx.state?.user as IUserSession;
  if (user == null) {
    await next();
    return;
  }

  const [items, taskOwnerCourses] = await Promise.all([
    getRepository(CourseUser)
      .createQueryBuilder('courseUser')
      .where('courseUser.userId = :userId', { userId: user.id })
      .getMany(),
    getRepository(CourseTask)
      .createQueryBuilder()
      .select('"courseId"')
      .where('"taskOwnerId" = :taskOwnerId', { taskOwnerId: user.id })
      .groupBy('"courseId"')
      .getRawMany(),
  ]);

  const courseRoles: CourseRoles = items.reduce(
    (acc, item) => ({
      ...acc,
      [item.courseId]: uniq(
        (user.coursesRoles?.[item.courseId] ?? ([] as CourseRole[]))
          .concat(item.isJuryActivist ? [CourseRole.JuryActivist] : [])
          .concat(item.isManager ? [CourseRole.Manager] : [])
          .concat(item.isSupervisor ? [CourseRole.Supervisor] : []),
      ),
    }),
    {},
  );
  taskOwnerCourses.forEach(({ courseId }) => {
    if (!courseRoles[courseId]) {
      courseRoles[courseId] = [];
    }
    courseRoles[courseId]?.push(CourseRole.TaskOwner);
  });
  user.coursesRoles = courseRoles;
  await next();
};
