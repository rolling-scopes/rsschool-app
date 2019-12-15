import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';

export const getMyMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId = ctx.state.user.id;

  const profile = await courseService.getStudentByUserId(courseId, userId);
  if (profile == null) {
    setResponse(ctx, BAD_REQUEST, profile);
    return;
  }
  const result = await courseService.getMentorWithContacts(profile.mentor!.id);
  setResponse(ctx, OK, result);
};
