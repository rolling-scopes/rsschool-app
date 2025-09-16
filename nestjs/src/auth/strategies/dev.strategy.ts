import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CurrentRequest } from '../auth.service';
import { Strategy } from 'passport-custom';
import { ConfigService } from '../../config';

import { AuthService } from '../auth.service';
import { JWT_COOKIE_NAME } from '../constants';
import { type Profile } from 'passport';

@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'dev') {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  public async validate(req: CurrentRequest): Promise<unknown> {
    const profile = {
      provider: '',
      id: '',
      username: this.config.auth.dev.username,
    } as Profile;

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
