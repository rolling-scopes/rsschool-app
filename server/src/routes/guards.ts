import Router from 'koa-router';
import { config } from '../config';
import { IUserSession } from '../models';
const auth = require('koa-basic-auth'); //tslint:disable-line

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });

const userGuards = (user: IUserSession) => {
  const guards = {
    isAdmin: () => user.isAdmin,
    isHirer: () => user.isHirer,
    hasRole: (courseId: number) => !!user.roles[courseId] || (user.coursesRoles?.[courseId] ?? false),
    isManager: (courseId: number) =>
      user.roles[courseId] === 'coursemanager' || (user.coursesRoles?.[courseId]?.includes('manager') ?? false),
    isMentor: (courseId: number) => user.roles[courseId] === 'mentor',
    isStudent: (courseId: number) => user.roles[courseId] === 'student',
    isTaskOwner: (courseId: number) => user.coursesRoles?.[courseId]?.includes('taskOwner') ?? false,
    isLoggedIn: (ctx: Router.RouterContext<any, any>) => user != null && (ctx.isAuthenticated() || config.isDevMode),
  };
  return {
    ...guards,
    isPowerUser: (courseId: number) => guards.isAdmin() || guards.isHirer() || guards.isManager(courseId),
  };
};

export const guard = async (ctx: Router.RouterContext<any, any>, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);
  if (guards.isLoggedIn(ctx)) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const courseGuard = async (ctx: Router.RouterContext<any, any>, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);
  const { courseId } = ctx.params;

  if (guards.isLoggedIn(ctx) && (guards.hasRole(courseId) || guards.isPowerUser(courseId))) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const courseMentorGuard = async (ctx: Router.RouterContext<any, any>, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);
  const { courseId } = ctx.params;

  if (guards.isLoggedIn(ctx) && (guards.isMentor(courseId) || guards.isPowerUser(courseId))) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const adminGuard = async (ctx: Router.RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);

  if (guards.isLoggedIn(ctx) && guards.isAdmin()) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const taskOwnerGuard = async (ctx: Router.RouterContext<any, any>, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);
  const { courseId } = ctx.params;
  if (
    guards.isLoggedIn(ctx) &&
    (guards.isTaskOwner(courseId) || guards.isMentor(courseId) || guards.isPowerUser(courseId))
  ) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};

export const courseManagerGuard = async (ctx: Router.RouterContext<any, any>, next: () => Promise<void>) => {
  const user = ctx.state.user as IUserSession;
  const guards = userGuards(user);
  const { courseId } = ctx.params;
  if (guards.isLoggedIn(ctx) && guards.isPowerUser(courseId)) {
    await next();
    return;
  }
  await basicAuthAdmin(ctx, next);
};
