import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../config';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';
import { AuthUser, CurrentRequest } from '..';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(private config: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: config.auth.github.clientId,
      clientSecret: config.auth.github.clientSecret,
      callbackURL: config.auth.github.callbackUrl,
      scope: config.auth.github.scope,
      passReqToCallback: true,
    });
  }

  async authenticate(req: CurrentRequest, options: object) {
    const { url } = req.query;
    const id = await this.authService.createLoginState({
      redirectUrl: url as string,
    });
    super.authenticate(req, {
      ...options,
      state: id,
    });
  }

  public async validate(
    request: CurrentRequest,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<AuthUser> {
    const state = await this.authService.getLoginState(request.query.state as string);
    if (!state) {
      throw new UnauthorizedException();
    }
    const user = await this.authService.createAuthUser(profile, this.config.auth.dev.admin);

    this.logger.log({ message: `Logged in: [${user.githubId}]`, githubId: user.githubId });

    request.loginState = state.data;

    return user;
  }
}
