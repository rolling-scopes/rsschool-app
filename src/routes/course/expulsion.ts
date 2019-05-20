import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Student } from '../../models';
import { ILogger } from '../../logger';
import { mentorsService } from '../../services';

type ExpulsionInput = {
  studentId: number;
  comment?: string;
};

export const postExpulsion = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  logger.info(ctx.request.body);

  const data: ExpulsionInput = ctx.request.body;

  const id = ctx.state.user.id;
  const mentor = await mentorsService.getCourseMentorWithUser(courseId, id);

  if (mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
    return;
  }

  const student = await getRepository(Student).findOne(Number(data.studentId), { relations: ['mentor'] });
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (student.mentor.id !== mentor.id) {
    setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
    return;
  }

  student.isExpelled = true;
  student.expellingReason = data.comment || '';

  const result = await getRepository(Student).save(student);
  setResponse(ctx, OK, result);
  return;
};
