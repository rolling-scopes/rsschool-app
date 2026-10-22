import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '../../config';
import { JWT_TOKEN_EXPIRATION } from '../../auth/constants';
import { AuthUser, JwtToken } from '../../auth/auth-user.model';

export const AUTH_TOKEN_AUDIENCE = 'rsschool-app';
export const CALENDAR_TOKEN_AUDIENCE = 'rsschool-calendar';

@Injectable()
export class JwtService {
  private readonly secretKey: string = '';

  constructor(readonly configService: ConfigService) {
    this.secretKey = configService.auth.jwt.secretKey;
  }

  public createToken(payload: AuthUser) {
    const tokenPayload: JwtToken = {
      id: payload.id,
      githubId: payload.githubId,
      isAdmin: payload.isAdmin,
      isHirer: payload.isHirer,
      purpose: 'authentication',
    };
    const jwt: string = sign(tokenPayload, this.secretKey, {
      expiresIn: JWT_TOKEN_EXPIRATION,
      audience: AUTH_TOKEN_AUDIENCE,
    });
    return jwt;
  }

  public createPublicCalendarToken<T>(payload: T) {
    const jwt: string = sign(JSON.parse(JSON.stringify(payload)) as object, this.secretKey, {
      expiresIn: '365d',
      audience: CALENDAR_TOKEN_AUDIENCE,
    });
    return jwt;
  }

  public validateToken<T>(token: string, audience: string = AUTH_TOKEN_AUDIENCE): T {
    return verify(token, this.secretKey, { audience }) as T;
  }
}
