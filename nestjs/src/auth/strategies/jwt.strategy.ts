import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_COOKIE_NAME } from '../constants';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth-user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.[JWT_COOKIE_NAME] || ExtractJwt.fromAuthHeaderAsBearerToken()(req),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwt.secretKey,
    });
  }

  public async validate(payload: AuthUser): Promise<any> {
    const { courses } = await this.authService.getAuthUser(payload.githubId);
    return {
      ...payload,
      courses,
    };
  }
}
