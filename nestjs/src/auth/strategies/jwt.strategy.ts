import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_COOKIE_NAME } from '../constants';
import { AuthService } from '../auth.service';
import { AuthUser, JwtToken } from '../auth-user.model';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AUTH_TOKEN_AUDIENCE } from '../../core/jwt/jwt.service';

/** Structural shape instead of the express Request type: works on any adapter. */
type RequestWithAuth = {
  cookies?: Record<string, string | undefined>;
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: RequestWithAuth) =>
        req.cookies?.[JWT_COOKIE_NAME] || ExtractJwt.fromAuthHeaderAsBearerToken()(req as never),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwt.secretKey,
      audience: AUTH_TOKEN_AUDIENCE,
    });
  }

  public async validate(payload: JwtToken): Promise<AuthUser> {
    if (
      payload.purpose !== 'authentication' ||
      !Number.isInteger(payload.id) ||
      payload.id <= 0 ||
      typeof payload.githubId !== 'string' ||
      payload.githubId.length === 0
    ) {
      throw new UnauthorizedException('Invalid authentication token');
    }
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
