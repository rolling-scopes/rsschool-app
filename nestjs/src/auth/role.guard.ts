import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, CourseRole } from './auth-user.model';
import { CurrentRequest } from './auth.service';
import { APP_ROLE_KEY, COURSE_ROLE_KEY } from './role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const cls = context.getClass();

    const appRoles = this.reflector.getAllAndOverride<Role[]>(APP_ROLE_KEY, [handler, cls]) ?? [];
    const courseRoles = this.reflector.getAllAndOverride<CourseRole[]>(COURSE_ROLE_KEY, [handler, cls]) ?? [];
    const req = context.getArgs<[CurrentRequest]>()[0];
    const { user, params } = req;

    if (appRoles.includes(Role.Admin) && !user.isAdmin) {
      throw new ForbiddenException();
    }

    if (courseRoles.length > 0 && params.courseId != null) {
      const allowed = courseRoles.some(courseRole => user.coursesRoles[params.courseId]?.includes(courseRole));
      if (!allowed) {
        throw new ForbiddenException();
      }
    }
    return true;
  }
}
