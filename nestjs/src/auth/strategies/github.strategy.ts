import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../config';
import { Strategy, Profile } from 'passport-github2';
import { AuthService, LoginStateParams } from '../auth.service';
import { AuthUser, CurrentRequest } from '..';
import passport from 'passport';
import * as dayjs from 'dayjs';

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

  async authenticate(req: CurrentRequest, options: passport.AuthenticateOptions) {
    const { url, code } = req.query;
    const opts = { ...options };

    if (!code) {
      const id = await this.authService.createLoginState({
        data: {
          redirectUrl: url as string,
        },
        expires: dayjs().add(1, 'hour').toISOString(),
      });
      opts.state = id;
    }

    super.authenticate(req, opts);
  }

  public async validate(
    request: CurrentRequest,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<AuthUser> {
    const state = await this.authService.getLoginStateById(request.query.state as string);
    if (!state) {
      throw new UnauthorizedException();
    }
    const [user] = await Promise.all([
      this.authService.createAuthUser(profile, this.config.auth.dev.admin),
      this.authService.deleteLoginState(state.id),
    ]);

    this.logger.log({ message: `Logged in: [${user.githubId}]`, githubId: user.githubId });

    request.loginState = state.data;

    return user;
  }

  public async getAuthorizeUrl(params: LoginStateParams) {
    const id = await this.authService.createLoginState(params);

    const url = this._oauth2.getAuthorizeUrl({
      redirect_uri: this.config.auth.github.callbackUrl,
      state: id,
      scope: this.config.auth.github.scope,
    });
    return url;
  }
}
