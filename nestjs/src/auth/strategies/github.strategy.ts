import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../config';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(configService: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: configService.auth.github.clientId,
      clientSecret: configService.auth.github.clientSecret,
      callbackURL: configService.auth.github.callbackUrl,
      scope: configService.auth.github.scope,
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: any): Promise<void> {
    const user = await this.authService.createUser(profile);

    this.logger.log({ message: `Logged in: [${user.githubId}]`, githubId: user.githubId });

    done(null, user);
  }
}
