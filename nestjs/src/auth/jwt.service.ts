import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { JWT_TOKEN_EXPIRATION } from './constants';

@Injectable()
export class JwtService {
  private readonly secretKey = '';

  constructor(readonly configService: ConfigService) {
    this.secretKey = configService.get('RSSHCOOL_JWT_SECRET_KEY');
  }

  public createToken(payload: any) {
    const jwt: string = sign(payload, this.secretKey, { expiresIn: JWT_TOKEN_EXPIRATION });
    return jwt;
  }

  public validateToken<T>(token: string): T {
    return verify(token, this.secretKey) as T;
  }
}
