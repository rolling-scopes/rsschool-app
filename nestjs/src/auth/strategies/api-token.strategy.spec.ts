import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ApiTokenStrategy } from './api-token.strategy';
import { PersonalAccessTokensService } from '../../personal-access-tokens/personal-access-tokens.service';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth-user.model';

describe('ApiTokenStrategy', () => {
  let strategy: ApiTokenStrategy;
  const tokens = { validateTokenString: vi.fn(), touchLastUsed: vi.fn() };
  const authService = { getAuthUser: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenStrategy,
        { provide: PersonalAccessTokensService, useValue: tokens },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();
    strategy = module.get<ApiTokenStrategy>(ApiTokenStrategy);
  });

  it('resolves the AuthUser and stamps the token id on success', async () => {
    tokens.validateTokenString.mockResolvedValue({ ok: true, record: { id: 'tok-1', user: { githubId: 'octo' } } });
    const authUser = { githubId: 'octo' } as AuthUser;
    authService.getAuthUser.mockResolvedValue(authUser);

    const result = await strategy.validate('rsapp_pat_x');

    expect(result).toBe(authUser);
    expect(result.apiTokenId).toBe('tok-1');
    expect(authService.getAuthUser).toHaveBeenCalledWith('octo');
    expect(tokens.touchLastUsed).toHaveBeenCalledWith('tok-1');
  });

  // Every failure reason must collapse to the same generic 401 so a caller can't
  // distinguish "unknown token" from "known prefix, wrong secret" etc.
  it.each(['malformed', 'not_found', 'revoked', 'expired', 'invalid_secret'] as const)(
    'returns a generic 401 for reason "%s" without leaking it',
    async reason => {
      tokens.validateTokenString.mockResolvedValue({ ok: false, reason });

      const err = await strategy.validate('rsapp_pat_x').catch((e: Error) => e);

      expect(err).toBeInstanceOf(UnauthorizedException);
      expect((err as Error).message).toBe('Invalid API token');
      expect((err as Error).message).not.toContain(reason);
      expect(authService.getAuthUser).not.toHaveBeenCalled();
    },
  );

  it('returns the same generic 401 when the token has no associated user', async () => {
    tokens.validateTokenString.mockResolvedValue({ ok: true, record: { id: 'tok-2', user: undefined } });

    const err = await strategy.validate('rsapp_pat_x').catch((e: Error) => e);

    expect(err).toBeInstanceOf(UnauthorizedException);
    expect((err as Error).message).toBe('Invalid API token');
    expect(authService.getAuthUser).not.toHaveBeenCalled();
  });
});
