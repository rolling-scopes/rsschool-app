import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { MentorWithContacts } from '../../services/courseService';
import { setResponse } from '../utils';

type StudentProfile = {
  courseId: number;
  totalScore: number;
  mentor: MentorWithContacts | null;
};

export const getStudentProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId = ctx.state.user.id;

  const profile = await courseService.getStudentByUserId(courseId, userId);
  if (profile == null) {
    setResponse(ctx, NOT_FOUND, profile);
    return;
  }
  const mentor = profile.mentor ? await courseService.getMentorWithContacts(profile.mentor.id) : null;
  const result: StudentProfile = {
    courseId,
    totalScore: 0,
    mentor,
  };
  setResponse(ctx, OK, result);
};
