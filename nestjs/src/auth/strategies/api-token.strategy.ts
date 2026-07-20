import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { PersonalAccessTokensService } from '../../personal-access-tokens/personal-access-tokens.service';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth-user.model';

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(Strategy, 'api-token') {
  private readonly logger = new Logger(ApiTokenStrategy.name);

  constructor(
    private readonly tokens: PersonalAccessTokensService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  public async validate(token: string): Promise<AuthUser> {
    const result = await this.tokens.validateTokenString(token);
    if (!result.ok) {
      // Keep the specific reason server-side only; a generic 401 to the client
      // avoids leaking whether a token prefix exists (valid-prefix vs unknown).
      this.logger.debug(`API token rejected: ${result.reason}`);
      throw new UnauthorizedException('Invalid API token');
    }

    const githubId = result.record.user?.githubId;
    if (!githubId) {
      this.logger.warn(`API token ${result.record.id} has no associated user`);
      throw new UnauthorizedException('Invalid API token');
    }
    const authUser = await this.authService.getAuthUser(githubId);
    authUser.apiTokenId = result.record.id;

    void this.tokens.touchLastUsed(result.record.id);

    return authUser;
  }
}
