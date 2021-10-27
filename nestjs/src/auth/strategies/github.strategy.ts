import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
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
