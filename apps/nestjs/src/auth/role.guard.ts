import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '.';
import { Role, CourseRole } from './auth-user.model';
import { CurrentRequest } from './auth.service';
import { REQUIRED_ROLES_KEY } from './role.decorator';

const appRoles = Object.values(Role);
const courseRoles = Object.values(CourseRole);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const cls = context.getClass();

    const { requireCourseMatch, roles = [] } =
      this.reflector.getAllAndOverride<{ roles: (CourseRole | Role)[]; requireCourseMatch: boolean }>(
        REQUIRED_ROLES_KEY,
        [handler, cls],
      ) ?? {};

    const req = context.getArgs<[CurrentRequest]>()[0];
    const { user, params } = req;

    const requiredAppRoles = roles.filter(role => appRoles.includes(role as Role)) as Role[];
    const requiredCourseRoles = roles.filter(role => courseRoles.includes(role as CourseRole)) as CourseRole[];

    if (requiredAppRoles.length === 0 && requiredCourseRoles.length === 0) {
      return true;
    }

    if (requiredAppRoles.length && requiredAppRoles.some(requiredRole => user.appRoles.includes(requiredRole))) {
      return true;
    }

    if (requiredCourseRoles.length) {
      if (requireCourseMatch && params.courseId) {
        return checkUserHasCourseRole(requiredCourseRoles, user, Number(params.courseId));
      }

      return checkUserHasRoleInAnyCourse(requiredCourseRoles, user);
    }

    return false;
  }
}

function checkUserHasCourseRole(requiredCourseRoles: CourseRole[], user: AuthUser, courseId: number) {
  if (!courseId) {
    return false;
  }
  return requiredCourseRoles.some(courseRole => user.courses[courseId]?.roles.includes(courseRole));
}

function checkUserHasRoleInAnyCourse(requiredCourseRoles: CourseRole[], user: AuthUser) {
  const allCourseRoles = Object.values(user.courses);
  const hasRole = requiredCourseRoles.some(requiredRole =>
    allCourseRoles.some(({ roles }) => roles.includes(requiredRole)),
  );
  return hasRole;
}
