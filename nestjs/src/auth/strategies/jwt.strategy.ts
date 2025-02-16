import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_COOKIE_NAME } from '../constants';
import { AuthService } from '../auth.service';
import { AuthUser, JwtToken } from '../auth-user.model';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.[JWT_COOKIE_NAME] || ExtractJwt.fromAuthHeaderAsBearerToken()(req),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwt.secretKey,
    });
  }

  public async validate(payload: JwtToken): Promise<AuthUser> {
    const cacheKey = `auth-user-${payload.id}`;
    const cached = await this.cacheManager.get<AuthUser>(cacheKey);
    if (cached) {
      return cached;
    }
    const authUser = await this.authService.getAuthUser(payload.githubId);
    this.cacheManager.set(cacheKey, authUser, 1000 * 60 * 10);
    return authUser;
  }
}
