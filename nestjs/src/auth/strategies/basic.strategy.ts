import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { ConfigService } from 'src/config';
import { AuthUser } from '..';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly configService: ConfigService) {
    super({ passReqToCallback: true });
  }

  public async validate(_: any, username: string, password: string) {
    const { root } = this.configService.users;

    if (root.username === username && root.password === password) {
      return AuthUser.createAdmin();
    }
    throw new UnauthorizedException();
  }
}
