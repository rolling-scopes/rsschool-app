import Router from 'koa-router';
import { config } from '../config';
import { IUserSession } from '../models';
const auth = require('koa-basic-auth'); //tslint:disable-line

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });

export const guard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const courseGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
    const user = ctx.state.user as IUserSession;
    const courseId = Number(ctx.params.courseId);
    if ((courseId && user.roles[courseId]) || user.isAdmin || user.isHirer) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const courseMentorGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && (ctx.isAuthenticated() || config.isDevMode)) {
    const user = ctx.state.user as IUserSession;
    const courseId = Number(ctx.params.courseId);
    const isCourseManager = user.roles[courseId] === 'coursemanager';
    if ((courseId && user.roles[courseId] === 'mentor') || isCourseManager || user.isAdmin || user.isHirer) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const adminGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && ctx.state.user.isAdmin) {
    await next();
    return;
  }
  if (ctx.state.user != null && ctx.state.user.isHirer) {
    // Allow only readonly mode
    if (ctx.req.method === 'GET') {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const taskOwnerGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  const courseId: number = Number(ctx.params.courseId);
  const isTaskOwner = ctx.state.user.courseRoles.taskOwnerRole.courses.some(
    ({ id }: { id: number }) => id === courseId,
  );
  if (ctx.state.user != null && isTaskOwner) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const courseManagerGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  if (ctx.state.user != null && ctx.state.user.isAdmin) {
    await next();
    return;
  }
  if (ctx.state.user != null && ctx.state.user.isHirer) {
    // Allow only readonly mode
    if (ctx.req.method === 'GET') {
      await next();
      return;
    }
  }
  if (ctx.state.user != null) {
    const courseId = Number(ctx.params.courseId);
    const user = ctx.state.user as IUserSession;
    if (user.roles[courseId] === 'coursemanager') {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};
