import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '../../config';

import { AuthService } from '../auth.service';
import { JWT_COOKIE_NAME } from '../constants';

@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'dev') {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {
    super();
  }

  public async validate(req: any): Promise<any> {
    const profile = {
      provider: '',
      id: '',
      username: this.config.auth.dev.username,
    } as any;

    const user = await this.authService.createRequestUser(profile, this.config.auth.dev.admin);
    req.user = user;
    const token = this.authService.validateGithub(req);
    req.res.writeHead(302, {
      'Set-Cookie': `${JWT_COOKIE_NAME}=${encodeURI(token)}; HttpOnly; path=/`,
      Location: '/',
    });
    return true;
  }
}
