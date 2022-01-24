import { Injectable } from '@nestjs/common';
import { AuthUser, Role } from '../auth';

@Injectable()
export class CourseAccessService {
  public async canAccessCourse(user: AuthUser, courseId: number): Promise<boolean> {
    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    return !!user.courses[courseId];
  }
}
