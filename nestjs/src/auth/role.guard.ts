import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, CurrentUser } from './current-user.model';
import { ROLE_KEY } from './role.decorator';
import { CurrentRequest } from './auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    const role = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [context.getHandler(), context.getClass()]);
    console.log('context', context.getArgs());
    const user = context.getArgs<CurrentRequest[]>()[0].user;
    if (role == Role.Admin && !user.isAdmin) {
      throw new ForbiddenException();
    }
    return true;
  }
}
