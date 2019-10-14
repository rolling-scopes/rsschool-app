import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Student, IUserSession } from '../../models';
import { ILogger } from '../../logger';
import { courseService } from '../../services';

type ExpulsionInput = {
  studentId: number;
  comment?: string;
};

export const postExpulsion = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  logger.info(ctx.request.body);

  const data: ExpulsionInput = ctx.request.body;

  const { user } = ctx.state;

  const student = await courseService.getStudent(data.studentId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  const mentor = await courseService.getCourseMentorWithUser(courseId, user.id);
  if (!courseService.isPowerUser(courseId, ctx.state!.user as IUserSession)) {
    if (mentor == null) {
      setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
      return;
    }

    if (student.mentor!.id !== mentor.id) {
      setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
      return;
    }
  }

  const result = await getRepository(Student).update(student.id, {
    isExpelled: true,
    expellingReason: data.comment || '',
    endDate: new Date(),
  });

  setResponse(ctx, OK, result);
  return;
};
