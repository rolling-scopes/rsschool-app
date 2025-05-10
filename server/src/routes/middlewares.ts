import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { createQueryBuilder } from 'typeorm';
import { Next } from 'koa';
import { setResponse } from './utils';
import { IUserSession, CourseUser, CourseRole, User, JwtToken } from '../models';

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
  const user = ctx.state?.user as JwtToken;

  if (user == null) {
    await next();
    return;
  }

  const authDetails = await getAuthDetails(user.id);

  const enrichedUser: IUserSession = {
    ...authDetails,
    ...user,
    courses: {},
  };

  authDetails.students.forEach(student => {
    const current = enrichedUser.courses[student.courseId] ?? { mentorId: null, studentId: null, roles: [] };
    enrichedUser.courses[student.courseId] = {
      ...current,
      studentId: student.id,
      roles: current.roles.includes(CourseRole.Student) ? current.roles : current.roles.concat([CourseRole.Student]),
    };
  });
  authDetails.mentors.forEach(mentor => {
    const current = enrichedUser.courses[mentor.courseId] ?? { mentorId: null, studentId: null, roles: [] };
    enrichedUser.courses[mentor.courseId] = {
      ...current,
      mentorId: mentor.id,
      roles: current.roles.includes(CourseRole.Mentor) ? current.roles : current.roles.concat([CourseRole.Mentor]),
    };
  });
  ctx.state.user = enrichedUser;
  await next();
};

type AuthDetails = {
  id: number;
  githubId: string;
  students: { courseId: number; id: number; isExpelled?: boolean }[];
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
          .select(
            `jsonb_agg(json_build_object('id', student.id, 'courseId', student."courseId", 'isExpelled', student."isExpelled"))`,
          )
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
