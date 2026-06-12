import Router from '@koa/router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { StudentRepository } from '../../repositories/student.repository';
import { courseService } from '../../services';
import { setResponse } from '../utils';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const repository = getCustomRepository(StudentRepository);
  const students = await repository.findByMentor(courseId, githubId);
  setResponse(ctx, OK, students);
};

export const deleteMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.expelMentor(courseId, githubId);
  setResponse(ctx, OK);
};

export const restoreExpelledMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.restoreMentor(courseId, githubId);
  setResponse(ctx, OK);
};

export const getMentorInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params as Params;
  const mentor = await courseService.getMentorByGithubId(courseId, githubId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const students = await courseService.getInterviewStudentsByMentorId(courseTaskId, mentor.id);
  setResponse(ctx, OK, students);
};

