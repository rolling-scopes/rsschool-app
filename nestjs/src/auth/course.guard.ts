import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CurrentRequest } from './auth.service';

@Injectable()
export class CourseGuard implements CanActivate {
  public canActivate(context: ExecutionContext) {
    const req = context.getArgs<[CurrentRequest]>()[0];
    const { user, params } = req;

    if (user.isAdmin) {
      return true;
    }

    return Boolean(user.courses[params.courseId]);
  }
}
