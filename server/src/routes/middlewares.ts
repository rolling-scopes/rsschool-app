import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { createQueryBuilder, getRepository } from 'typeorm';
import { Next } from 'koa';
import { setResponse } from './utils';
import { IUserSession, CourseUser, NewCourseRole, CourseTask, User } from '../models';

export const courseMiddleware = async (ctx: Router.RouterContext, next: Next) => {
  if (!ctx.params.courseId) {
    await next();
    return;
  }
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, 'Incorrect [Course Id]');
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

  const [authDetails] = await Promise.all([
    getAuthDetails(user.id),
    getRepository(CourseTask)
      .createQueryBuilder()
      .select('"courseId"')
      .where('"taskOwnerId" = :taskOwnerId', { taskOwnerId: user.id })
      .groupBy('"courseId"')
      .getRawMany(),
  ]);

  authDetails.students.forEach(student => {
    user.roles[student.courseId] = 'student';
    if (user.courses) {
      const current = user.courses[student.courseId] ?? { mentorId: null, studentId: null, roles: [] };
      user.courses[student.courseId] = {
        ...current,
        studentId: student.id,
        roles: current.roles.includes(NewCourseRole.Student)
          ? current.roles
          : current.roles.concat([NewCourseRole.Student]),
      };
    }
  });
  authDetails.mentors.forEach(mentor => {
    user.roles[mentor.courseId] = 'mentor';
    if (user.courses) {
      const current = user.courses[mentor.courseId] ?? { mentorId: null, studentId: null, roles: [] };
      user.courses[mentor.courseId] = {
        ...current,
        mentorId: mentor.id,
        roles: current.roles.includes(NewCourseRole.Mentor)
          ? current.roles
          : current.roles.concat([NewCourseRole.Mentor]),
      };
    }
  });
  await next();
};

type AuthDetails = {
  id: number;
  githubId: string;
  students: { courseId: number; id: number }[];
  mentors: { courseId: number; id: number }[];
  courseUsers: CourseUser[];
};

// TODO: copy/paste from nestjs. Temporary
async function getAuthDetails(id: number): Promise<AuthDetails> {
  const query = createQueryBuilder(User, 'user')
    .select('user.id', 'id')
    .addSelect('user.githubId', 'githubId')
    .addSelect(
      qb =>
        qb
          .select(`jsonb_agg(json_build_object('id', mentor.id, 'courseId', mentor."courseId"))`)
          .from('mentor', 'mentor')
          .where('mentor.userId = :id', { id }),
      'mentors',
    )
    .addSelect(
      qb =>
        qb
          .select(`jsonb_agg(json_build_object('id', student.id, 'courseId', student."courseId"))`)
          .from('student', 'student')
          .where('student.userId = :id', { id }),
      'students',
    )
    .addSelect(
      qb =>
        qb.select('jsonb_agg("courseUser")').from(CourseUser, 'courseUser').where('courseUser.userId = :id', { id }),
      'courseUsers',
    )
    .where({ id });

  const result = await query.getRawOne();
  return {
    id: result.id,
    githubId: result.githubId,
    students: result.students ?? [],
    mentors: result.mentors ?? [],
    courseUsers: result.courseUsers ?? [],
  };
}
