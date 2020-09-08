import Router from '@koa/router';
import { config } from '../config';
import { IUserSession, CourseRole } from '../models';
const auth = require('koa-basic-auth'); //tslint:disable-line

type RouterContext = Router.RouterContext<{}, { state: { user?: IUserSession }; isAuthenticated: () => boolean }>;

const basicAuthAdmin = auth({ name: config.admin.username, pass: config.admin.password });
export const basicAuthAws = auth({
  name: config.users.verification.username,
  pass: config.users.verification.password,
});

const userGuards = (user: IUserSession) => {
  const courses = Object.keys(user.coursesRoles ?? {});
  const guards = {
    isAdmin: () => user.isAdmin,
    isHirer: () => user.isHirer,
    hasRole: (courseId: number) => !!user.roles[courseId] || (user.coursesRoles?.[courseId] ?? false),
    isAnyManager: () => courses.some((courseId: string) => user.coursesRoles?.[courseId]?.includes(CourseRole.manager)),
    isAnySupervisor: () =>
      courses.some((courseId: string) => user.coursesRoles?.[courseId]?.includes(CourseRole.supervisor)),
    isManager: (courseId: number) => user.coursesRoles?.[courseId]?.includes(CourseRole.manager) ?? false,
    isMentor: (courseId: number) => user.roles[courseId] === 'mentor',
    isAnyMentor: () => Object.keys(user.roles).some((role: string) => user.roles[role].includes('mentor')),
    isStudent: (courseId: number) => user.roles[courseId] === 'student',
    isTaskOwner: (courseId: number) => user.coursesRoles?.[courseId]?.includes(CourseRole.taskOwner) ?? false,
    isLoggedIn: (ctx: RouterContext) => user != null && (ctx.isAuthenticated() || config.isDevMode),
    isSupervisor: (courseId: number) => user.coursesRoles?.[courseId]?.includes(CourseRole.supervisor) ?? false,
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

export const courseMentorGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
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

export const anyCourseMentorGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
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

export const adminGuard = async (ctx: RouterContext, next: () => Promise<void>) => {
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
