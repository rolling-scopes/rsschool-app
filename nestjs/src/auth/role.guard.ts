import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './types';
import { ROLE_KEY } from './role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    const role = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [context.getHandler(), context.getClass()]);

    const user = context.getArgs()[0].user;
    if (role === Role.Admin && user.role !== Role.Admin) {
      throw new ForbiddenException();
    }
    return true;
  }
}
