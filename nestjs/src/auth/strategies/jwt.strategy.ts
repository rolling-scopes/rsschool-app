import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_COOKIE_NAME } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.[JWT_COOKIE_NAME] || ExtractJwt.fromAuthHeaderAsBearerToken()(req),
      ignoreExpiration: false,
      secretOrKey: configService.auth.jwt.secretKey,
    });
  }

  public async validate(payload: any): Promise<any> {
    Logger.log(payload);
    return payload;
  }
}
