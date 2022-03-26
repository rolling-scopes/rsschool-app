import Router from '@koa/router';
import { config } from '../config';
import {
  IUserSession,
  isAdmin,
  isHirer,
  isAnyManager,
  isAnySupervisor,
  isManager,
  isMentor,
  isAnyMentor,
  isStudent,
  isTaskOwner,
  isSupervisor,
} from '../models';
const auth = require('koa-basic-auth'); //tslint:disable-line

export type RouterContext = Router.RouterContext<
  {},
  { state: { user?: IUserSession }; isAuthenticated?: () => boolean }
>;

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });
export const basicAuthAws = auth({
  name: config.users.cloud.username,
  pass: config.users.cloud.password,
});

export const userGuards = (user: IUserSession) => {
  const guards = {
    isAdmin: () => isAdmin(user),
    isHirer: () => isHirer(user),
    hasRole: (courseId: number) => !!user.courses[courseId],
    isAnyManager: () => isAnyManager(user),
    isAnySupervisor: () => isAnySupervisor(user),
    isManager: (courseId: number) => isManager(user, courseId),
    isMentor: (courseId: number) => isMentor(user, courseId),
    isAnyMentor: () => isAnyMentor(user),
    isStudent: (courseId: number) => isStudent(user, courseId),
    isTaskOwner: (courseId: number) => isTaskOwner(user, courseId),
    isLoggedIn: (_: RouterContext) => user != null || config.isDevMode,
    isSupervisor: (courseId: number) => isSupervisor(user, courseId),
  };
  return {
    ...guards,
    isPowerUser: (courseId: number) => guards.isAdmin() || guards.isManager(courseId),
  };
};

export const guard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  if (user) {
    const guards = userGuards(user);
    if (guards.isLoggedIn(ctx)) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const courseGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  ctx.params.courseId = Number(ctx.params.courseId);
  const user = ctx.state.user;
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (guards.isLoggedIn(ctx) && (guards.hasRole(courseId) || guards.isPowerUser(courseId))) {
      await next();
      return;
    }
  }

  await basicAuthAdmin(ctx, next);
};

export const courseMentorGuard: Router.Middleware<{}, RouterContext> = async (
  ctx: RouterContext,
  next: () => Promise<void>,
) => {
  ctx.params.courseId = Number(ctx.params.courseId);
  const user = ctx.state.user;
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (
      guards.isLoggedIn(ctx) &&
      (guards.isMentor(courseId) || guards.isSupervisor(courseId) || guards.isPowerUser(courseId))
    ) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const anyCourseMentorGuard: Router.Middleware<{}, RouterContext> = async (
  ctx: RouterContext,
  next: () => Promise<void>,
) => {
  ctx.params.courseId = Number(ctx.params.courseId);
  const user = ctx.state.user;
  if (user) {
    const guards = userGuards(user);
    if (guards.isLoggedIn(ctx) && guards.isAnyMentor()) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const adminGuard: Router.Middleware<{}, RouterContext> = async (
  ctx: RouterContext,
  next: () => Promise<void>,
) => {
  const user = ctx.state.user;
  if (user) {
    const guards = userGuards(user);
    if (guards.isLoggedIn(ctx) && guards.isAdmin()) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const taskOwnerGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (
      guards.isLoggedIn(ctx) &&
      (guards.isTaskOwner(courseId) || guards.isMentor(courseId) || guards.isPowerUser(courseId))
    ) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const courseManagerGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (guards.isLoggedIn(ctx) && guards.isPowerUser(courseId)) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const anyCourseManagerGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    if (guards.isLoggedIn(ctx) && (guards.isAnyManager() || guards.isAdmin())) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const anyCoursePowerUserGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    if (guards.isLoggedIn(ctx) && (guards.isAnyManager() || guards.isAnySupervisor() || guards.isAdmin())) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const courseSupervisorGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (guards.isLoggedIn(ctx) && (guards.isPowerUser(courseId) || guards.isSupervisor(courseId))) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};

export const courseSupervisorOrMentorGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
  const user = ctx.state.user;
  ctx.params.courseId = Number(ctx.params.courseId);
  if (user) {
    const guards = userGuards(user);
    const { courseId } = ctx.params;
    if (
      guards.isLoggedIn(ctx) &&
      (guards.isPowerUser(courseId) || guards.isSupervisor(courseId) || guards.isMentor(courseId))
    ) {
      await next();
      return;
    }
  }
  await basicAuthAdmin(ctx, next);
};
