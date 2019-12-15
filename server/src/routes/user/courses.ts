import { OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Course, CourseManager, CourseUser, Mentor, Student, User, CourseTask } from '../../models';
import { setResponse } from '../utils';

export const getCourses = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.params;
  const isAdmin = ctx.state!.user && ctx.state!.user.isAdmin;

  if (isAdmin) {
    const courses = await getRepository(Course)
      .createQueryBuilder()
      .getMany();
    setResponse(ctx, OK, courses);
    return;
  }

  const user = await getRepository(User)
    .createQueryBuilder()
    .addSelect(['id'])
    .where('"githubId" = :githubId', { githubId })
    .getOne();
  const userId = user!.id;
  const courses = await getRepository(Course)
    .createQueryBuilder('course')
    .leftJoin(Student, 'student', 'student."courseId" = course.id AND student."userId" = :userId', { userId })
    .leftJoin(Mentor, 'mentor', 'mentor."courseId" = course.id AND mentor."userId" = :userId', { userId })
    .leftJoin(
      CourseManager,
      'courseManager',
      '"courseManager"."courseId" = course.id AND "courseManager"."userId" = :userId',
      { userId },
    )
    .leftJoin(CourseUser, 'courseUser', '"courseUser"."courseId" = course.id AND "courseUser"."userId" = :userId', {
      userId,
    })
    .leftJoin(CourseTask, 'courseTask', '"courseTask"."taskOwnerId" = :userId', { userId })
    .where('mentor.id IS NOT NULL')
    .orWhere('student.id IS NOT NULL')
    .orWhere('"courseManager".id IS NOT NULL')
    .orWhere('"courseUser".id IS NOT NULL')
    .orWhere('"courseTask"."taskOwnerId" = :userId', { userId })
    .orderBy('course."startDate"')
    .getMany();

  setResponse(ctx, OK, courses);
};
