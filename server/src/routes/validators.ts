import Router from '@koa/router';
import { setResponse } from './utils';
import { BAD_REQUEST, FORBIDDEN } from 'http-status-codes';
import { getCourseTask } from '../services/tasks.service';
import { DateTime } from 'luxon';
const auth = require('basic-auth'); //tslint:disable-line

export const validateGithubIdAndAccess = async (ctx: Router.RouterContext, next: any) => {
  let githubId: string = ctx.params.githubId;
  if (!githubId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [githubId]');
    return;
  }
  const user = ctx.state.user;
  if (githubId === 'me' && user) {
    githubId = user.githubId;
  } else {
    githubId = githubId.toLowerCase();
  }
  ctx.params.githubId = githubId;
  if ((user != null && user.isAdmin) || auth(ctx)) {
    await next();
    return;
  }
  if (user.githubId !== githubId) {
    setResponse(ctx, FORBIDDEN);
    return;
  }
  await next();
};

export const validateCrossCheckExpirationDate = async (ctx: Router.RouterContext, next: any) => {
  const courseTaskId: string = ctx.params.courseTaskId;
  if (!courseTaskId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [courseTaskId]');
    return;
  }

  const task: any = await getCourseTask(Number(courseTaskId));
  if (DateTime.local() > DateTime.fromJSDate(task.studentEndDate)) {
    setResponse(ctx, BAD_REQUEST, 'Cross Check deadline has expired');
    return;
  }

  await next();
};

export const validateGithubId = async (ctx: Router.RouterContext, next: any) => {
  let githubId: string = ctx.params.githubId;
  if (!githubId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [githubId]');
    return;
  }
  const user = ctx.state.user;
  if (githubId === 'me' && user) {
    githubId = user.githubId;
  } else {
    githubId = githubId.toLowerCase();
  }
  ctx.params.githubId = githubId;
  await next();
};
