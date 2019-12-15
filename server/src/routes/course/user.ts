import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { userService, courseService } from '../../services';
import { CourseUser } from '../../models';

type PostInput = {
  isManager: boolean;
  isJuryActivist: boolean;
  isSupervisor: boolean;
};

export const postUser = (_?: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const user = await userService.getUserByGithubId(githubId);
  if (user == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const { isJuryActivist, isManager, isSupervisor }: PostInput = ctx.request.body;
  await getRepository(CourseUser).insert({ courseId, userId: user.id, isJuryActivist, isManager, isSupervisor });
  setResponse(ctx, OK);
};

export const getUsers = (_?: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;
  const data = await courseService.getUsers(courseId);
  if (data == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, data);
};

export const putUser = (_?: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const user = await userService.getUserByGithubId(githubId);
  if (user == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const existing = await getRepository(CourseUser).findOne({ where: { courseId, userId: user.id } });
  if (existing == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const { isJuryActivist, isManager, isSupervisor }: PostInput = ctx.request.body;
  await getRepository(CourseUser).update(existing.id, { isJuryActivist, isManager, isSupervisor });
  setResponse(ctx, OK);
};
