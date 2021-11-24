import { SetMetadata } from '@nestjs/common';
import { Role, CourseRole } from './auth-user.model';

export const APP_ROLE_KEY = 'roles';
export const COURSE_ROLE_KEY = 'courseRoles';

export const RequiredAppRoles = (roles: Role[]) => SetMetadata(APP_ROLE_KEY, roles);

export const RequiredCourseRoles = (roles: CourseRole[]) => SetMetadata(COURSE_ROLE_KEY, roles);
