import * as Router from 'koa-router';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Course } from '../../models';
import { ILogger } from '../../logger';
import { userService } from '../../services';

export const getMe = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId = ctx.state.user.id;

  const profile = await userService.getFullUserById(userId);
  if (profile == null) {
    setResponse(ctx, BAD_REQUEST, profile);
    return;
  }
  const student = (profile.students || []).find(student => (student.course as Course).id === courseId);
  const mentor = (profile.mentors || []).find(mentor => (mentor.course as Course).id === courseId);

  const result = {
    userId,
    studentId: student ? student.id : null,
    mentorId: mentor ? mentor.id : null,
  };
  setResponse(ctx, OK, result);
};
