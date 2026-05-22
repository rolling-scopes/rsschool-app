import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { PersonalAccessTokensService } from '../../personal-access-tokens/personal-access-tokens.service';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth-user.model';

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(Strategy, 'api-token') {
  constructor(
    private readonly tokens: PersonalAccessTokensService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  public async validate(token: string): Promise<AuthUser> {
    const result = await this.tokens.validateTokenString(token);
    if (!result.ok) {
      throw new UnauthorizedException(`Invalid API token: ${result.reason}`);
    }

    const githubId = result.record.user?.githubId;
    if (!githubId) {
      throw new UnauthorizedException('API token user not found');
    }
    const authUser = await this.authService.getAuthUser(githubId);
    authUser.apiTokenId = result.record.id;

    void this.tokens.touchLastUsed(result.record.id);

    return authUser;
  }
}
