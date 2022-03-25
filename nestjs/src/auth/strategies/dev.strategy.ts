import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CurrentRequest } from '../auth.service';
import { Strategy } from 'passport-custom';
import { ConfigService } from '../../config';

import { AuthService } from '../auth.service';
import { JWT_COOKIE_NAME } from '../constants';

@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'dev') {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {
    super();
  }

  public async validate(req: CurrentRequest): Promise<any> {
    const profile = {
      provider: '',
      id: '',
      username: this.config.auth.dev.username,
    } as any;

    const user = await this.authService.createAuthUser(profile, this.config.auth.dev.admin);
    req.user = user;
    const token = this.authService.validateGithub(req);
    if (!token) {
      throw new Error('Invalid token');
    }
    req.res?.writeHead(302, {
      'Set-Cookie': `${JWT_COOKIE_NAME}=${encodeURI(token)}; HttpOnly; path=/;`,
      Location: '/',
    });
    return true;
  }
}
