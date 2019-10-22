import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Student, IUserSession } from '../../models';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import * as stageInterviews from '../../services/stageInterviews';

type ExpulsionInput = {
  studentId: number;
  comment?: string;
};

export const postExpulsion = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  logger.info(ctx.request.body);

  const data: ExpulsionInput = ctx.request.body;

  const { user } = ctx.state;
  const studentId = Number(data.studentId);

  const student = await courseService.getStudent(studentId);
  const interviews = await stageInterviews.getInterviewsByStudent(courseId, studentId);
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

    if (!interviews.some(it => it.mentor.id === mentor.id) && (!student.mentor || student.mentor!.id !== mentor.id)) {
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
