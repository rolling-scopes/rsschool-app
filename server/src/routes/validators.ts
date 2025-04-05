import Router from '@koa/router';
import { Next } from 'koa';
import { setResponse } from './utils';
import { BAD_REQUEST, FORBIDDEN } from 'http-status-codes';
import { getCourseTask } from '../services/tasks.service';
import { DateTime } from 'luxon';
import { CourseRole } from '../models';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const auth = require('basic-auth'); //tslint:disable-line

export const validateGithubIdAndAccess = async (ctx: Router.RouterContext, next: Next) => {
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

// This validator exists to cover specific case of course manager functionality and leave untouched rest endpoints
// See https://github.com/rolling-scopes/rsschool-app/issues/2611
// After migration to nestjs should be replaced with appropriate role check
export const validateGithubIdAndAccessForUserOrPowerUser = async (ctx: Router.RouterContext, next: Next) => {
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
  const isCourseManager = Boolean(
    ctx.params.courseId && user?.courses[ctx.params.courseId]?.roles?.includes(CourseRole.Manager),
  );
  if ((user != null && (user.isAdmin || isCourseManager)) || auth(ctx)) {
    await next();
    return;
  }
  if (user.githubId !== githubId) {
    setResponse(ctx, FORBIDDEN);
    return;
  }
  await next();
};

export const validateCrossCheckExpirationDate = async (ctx: Router.RouterContext, next: Next) => {
  const courseTaskId: string = ctx.params.courseTaskId;
  if (!courseTaskId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [courseTaskId]');
    return;
  }

  const task = await getCourseTask(Number(courseTaskId));
  if (!task || (task.studentEndDate && DateTime.local() > DateTime.fromJSDate(new Date(task.studentEndDate)))) {
    setResponse(ctx, BAD_REQUEST, 'Cross Check deadline has expired');
    return;
  }

  await next();
};

export const validateGithubId = async (ctx: Router.RouterContext, next: Next) => {
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

export const validateExpelledStudent = async (ctx: Router.RouterContext, next: Next) => {
  const githubId: string = ctx.params.githubId;
  if (!githubId) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [githubId]');
    return;
  }
  const user = ctx.state.user;
  const courseId = ctx.params.courseId;
  if (user.courses[courseId].isExpelled) {
    setResponse(ctx, FORBIDDEN);
    return;
  }
  await next();
};
