import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secretKey = '';

  constructor(readonly configService: ConfigService) {
    this.secretKey = configService.get('RSSHCOOL_JWT_SECRET_KEY');
  }

  public createToken(payload: any) {
    const jwt: string = sign(payload, this.secretKey, { expiresIn: '7d' });
    return jwt;
  }

  public validateToken<T>(token: string): T {
    return verify(token, this.secretKey) as T;
  }
}
