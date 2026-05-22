import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentRequest } from './auth.service';
import { DENY_API_TOKEN_KEY } from './deny-api-token.decorator';

@Injectable()
export class ApiTokenDenyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const enabled = this.reflector.getAllAndOverride<boolean>(DENY_API_TOKEN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!enabled) return true;

    const req = context.getArgs<[CurrentRequest]>()[0];
    if (req.user?.apiTokenId) {
      throw new ForbiddenException('This endpoint cannot be called with an API token');
    }
    return true;
  }
}
