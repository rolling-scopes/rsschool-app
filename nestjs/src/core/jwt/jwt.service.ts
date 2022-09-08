import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '../../config';
import { JWT_TOKEN_EXPIRATION } from '../../auth/constants';

@Injectable()
export class JwtService {
  private readonly secretKey: string = '';

  constructor(readonly configService: ConfigService) {
    this.secretKey = configService.auth.jwt.secretKey;
  }

  public createToken(payload: any) {
    const jwt: string = sign(JSON.parse(JSON.stringify(payload)), this.secretKey, { expiresIn: JWT_TOKEN_EXPIRATION });
    return jwt;
  }

  public createPublicCalendarToken<T>(payload: T) {
    const jwt: string = sign(JSON.parse(JSON.stringify(payload)), this.secretKey, { expiresIn: '365d' });
    return jwt;
  }

  public validateToken<T>(token: string): T {
    return verify(token, this.secretKey) as T;
  }
}
