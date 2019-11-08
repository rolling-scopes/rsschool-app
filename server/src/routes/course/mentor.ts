import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const mentor = await courseService.getMentorByUserId(courseId, userId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await courseService.getStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, students);
};

export const getMentorInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const mentor = await courseService.getMentorByUserId(courseId, userId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await courseService.getInterviewStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, students);
};

export const getAllMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const mentor = await courseService.getMentorByUserId(courseId, userId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const students = await courseService.getStudentsByMentorId(mentor.id);
  const assignedStudents = await courseService.getAssignedStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, { students, assignedStudents });
};

export const deleteMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.expelMentor(courseId, githubId);
  setResponse(ctx, OK);
};
