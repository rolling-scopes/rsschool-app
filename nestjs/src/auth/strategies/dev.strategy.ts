import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '../../config';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth-user.model';
import { type Profile } from 'passport';

/**
 * Dev-only stand-in for the github strategy: authenticates the configured dev
 * user without the OAuth round trip. The guard puts the returned user on
 * req.user and the auth controller handles the cookie/redirect (the strategy
 * used to write the response itself via req.res.writeHead — an Express-only
 * shortcut that silently no-ops on other adapters).
 */
@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'dev') {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  public async validate(): Promise<AuthUser> {
    const profile = {
      provider: '',
      id: '',
      username: this.config.auth.dev.username,
    } as Profile;

    return this.authService.createAuthUser(profile, this.config.auth.dev.admin);
  }
}
