import { SetMetadata } from '@nestjs/common';
import { Role, CourseRole } from './auth-user.model';

export const REQUIRED_ROLES_KEY = 'requiredRoles';

export const RequiredRoles = (roles: (CourseRole | Role)[], requireCourseMatch = false) =>
  SetMetadata(REQUIRED_ROLES_KEY, { roles, requireCourseMatch });
