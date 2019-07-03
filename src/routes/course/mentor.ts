import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Mentor } from '../../models';
import { setResponse } from '../utils';
import { studentsService } from '../../services';

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const id = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const mentor = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor."courseId" = :courseId AND mentor.user.id = :id', { id, courseId })
    .getOne();

  if (mentor === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await studentsService.getMentorStudents(mentor.id);
  const mentorResponse = { students };

  setResponse(ctx, OK, mentorResponse);
};

export const getMentorOtherStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const id = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;
  const query = ctx.query as { courseTaskId: string | undefined };
  const courseTaskId = Number(query.courseTaskId);

  const mentor = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor."courseId" = :courseId AND mentor.user.id = :id', { id, courseId })
    .getOne();

  if (mentor === undefined || !courseTaskId) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await studentsService.getMentorOtherStudents(courseId, id, courseTaskId);

  setResponse(ctx, OK, { students });
};
