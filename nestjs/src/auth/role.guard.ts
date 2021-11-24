import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './types';
import { ROLE_KEY } from './role.decorator';
import { RequestUser } from './auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    // const role = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [context.getHandler(), context.getClass()]);

    console.log(context.getArgs());
    const user = context.getArgs()[0].user as RequestUser;
    if (!user.isAdmin) {
      throw new ForbiddenException();
    }
    return true;
  }
}
