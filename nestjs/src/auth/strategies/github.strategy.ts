import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../config';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(private config: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: config.auth.github.clientId,
      clientSecret: config.auth.github.clientSecret,
      callbackURL: config.auth.github.callbackUrl,
      scope: config.auth.github.scope,
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: any): Promise<void> {
    const user = await this.authService.createAuthUser(profile, this.config.auth.dev.admin);

    this.logger.log({ message: `Logged in: [${user.githubId}]`, githubId: user.githubId });

    done(null, user);
  }
}
