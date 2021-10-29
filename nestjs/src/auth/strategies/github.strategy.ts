import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.get('RSSHCOOL_GITHUB_CLIENT_ID'),
      clientSecret: configService.get('RSSHCOOL_GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('RSSHCOOL_GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: any, done: any): Promise<any> {
    const { email, login } = profile._json;

    const user = {
      primaryEmail: email,
      githubId: login,
    };

    this.logger.log({ message: `Logged in: [${user.githubId}]`, githubId: user.githubId });

    done(null, user);
  }
}
