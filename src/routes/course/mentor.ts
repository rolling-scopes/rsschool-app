import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Mentor } from '../../models';
import { setResponse } from '../utils';
import { studentsService } from '../../services';

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const id = ctx.state!.user.id;
  const courseId = Number(ctx.params.courseId);

  const mentor = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .where('"mentor"."courseId" = :courseId', { courseId })
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor.user.id = :id', { id })
    .getOne();

  if (mentor === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await studentsService.getMentorStudents(mentor.id);
  const mentorResponse = { students };

  setResponse(ctx, OK, mentorResponse);
};
