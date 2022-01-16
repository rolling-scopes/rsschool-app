import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly configService: ConfigService) {
    super({ passReqToCallback: true });
  }

  public async validate(_: any, username: string, password: string): Promise<boolean> {
    if (
      this.configService.get<string>('RSSHCOOL_USERS_ROOT_USERNAME') === username &&
      this.configService.get<string>('RSSHCOOL_USERS_ROOT_PASSWORD') === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
