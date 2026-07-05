import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import type { Profile } from 'passport-github2';
import { GithubStrategy } from './github.strategy';
import { ConfigService } from '../../config';
import { AuthService, CurrentRequest, LoginStateParams } from '../auth.service';
import { AuthUser } from '..';

const mockConfig = {
  auth: {
    github: {
      clientId: 'client-id',
      clientSecret: 'client-secret',
      callbackUrl: 'https://app.example/callback',
      scope: ['user:email'],
    },
    dev: {
      admin: false,
    },
  },
} as Partial<ConfigService> as ConfigService;

const mockProfile = {
  provider: 'github',
  id: '12345',
  username: 'johndoe',
} as Profile;

const mockAuthUser = {
  id: 1,
  githubId: 'johndoe',
} as AuthUser;

const mockLoginState = {
  id: 'state-id',
  data: { redirectUrl: '/home' },
};

describe('GithubStrategy', () => {
  let strategy: GithubStrategy;
  let authService: Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubStrategy,
        { provide: ConfigService, useValue: mockConfig },
        {
          provide: AuthService,
          useValue: {
            createLoginState: vi.fn(),
            getLoginStateById: vi.fn(),
            createAuthUser: vi.fn(),
            deleteLoginState: vi.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GithubStrategy>(GithubStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('authenticate', () => {
    let superAuthenticate: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // super.authenticate resolves to passport-oauth2's prototype method.
      superAuthenticate = vi.spyOn(OAuth2Strategy.prototype, 'authenticate').mockImplementation(() => undefined);
    });

    it('creates a login state and injects it as `state` when no code is present', async () => {
      authService.createLoginState.mockResolvedValue('new-state-id');
      const req = { query: { url: 'https://app.example/dashboard' } } as unknown as CurrentRequest;
      const options = { scope: ['user:email'] };

      await strategy.authenticate(req, options);

      expect(authService.createLoginState).toHaveBeenCalledWith({
        data: { redirectUrl: 'https://app.example/dashboard' },
        expires: expect.any(String),
      });
      expect(superAuthenticate).toHaveBeenCalledWith(req, { scope: ['user:email'], state: 'new-state-id' });
    });

    it('does not create a login state and forwards the original options when a code is present', async () => {
      const req = { query: { code: 'oauth-code', url: 'https://app.example/dashboard' } } as unknown as CurrentRequest;
      const options = { scope: ['user:email'] };

      await strategy.authenticate(req, options);

      expect(authService.createLoginState).not.toHaveBeenCalled();
      expect(superAuthenticate).toHaveBeenCalledWith(req, { scope: ['user:email'] });
    });

    it('passes undefined redirectUrl through when the url query param is missing', async () => {
      authService.createLoginState.mockResolvedValue('new-state-id');
      const req = { query: {} } as unknown as CurrentRequest;

      await strategy.authenticate(req, {});

      expect(authService.createLoginState).toHaveBeenCalledWith({
        data: { redirectUrl: undefined },
        expires: expect.any(String),
      });
      expect(superAuthenticate).toHaveBeenCalledWith(req, { state: 'new-state-id' });
    });

    it('sets the state expiry roughly one hour in the future', async () => {
      authService.createLoginState.mockResolvedValue('new-state-id');
      const req = { query: { url: '/x' } } as unknown as CurrentRequest;
      const before = Date.now();

      await strategy.authenticate(req, {});

      const arg = authService.createLoginState.mock.calls[0][0];
      const expiresMs = new Date(arg.expires as string).getTime();
      // ~1 hour ahead (allow a wide window for test execution time).
      expect(expiresMs).toBeGreaterThan(before + 59 * 60 * 1000);
      expect(expiresMs).toBeLessThan(before + 61 * 60 * 1000);
    });
  });

  describe('validate', () => {
    it('throws UnauthorizedException when the login state is not found', async () => {
      authService.getLoginStateById.mockResolvedValue(null);
      const request = { query: { state: 'missing-state' } } as unknown as CurrentRequest;

      await expect(strategy.validate(request, 'access', 'refresh', mockProfile)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(authService.createAuthUser).not.toHaveBeenCalled();
      expect(authService.deleteLoginState).not.toHaveBeenCalled();
    });

    it('creates the auth user, deletes the state, sets loginState and returns the user on a valid state', async () => {
      authService.getLoginStateById.mockResolvedValue(mockLoginState as never);
      authService.createAuthUser.mockResolvedValue(mockAuthUser);
      authService.deleteLoginState.mockResolvedValue({} as never);
      const request = { query: { state: 'state-id' } } as unknown as CurrentRequest;

      const result = await strategy.validate(request, 'access', 'refresh', mockProfile);

      expect(authService.getLoginStateById).toHaveBeenCalledWith('state-id');
      expect(authService.createAuthUser).toHaveBeenCalledWith(mockProfile, false);
      expect(authService.deleteLoginState).toHaveBeenCalledWith('state-id');
      expect(request.loginState).toEqual(mockLoginState.data);
      expect(result).toBe(mockAuthUser);
    });

    it('passes the dev admin flag through to createAuthUser', async () => {
      const adminConfig = {
        ...mockConfig,
        auth: { ...mockConfig.auth, dev: { admin: true } },
      } as ConfigService;
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GithubStrategy,
          { provide: ConfigService, useValue: adminConfig },
          {
            provide: AuthService,
            useValue: {
              createLoginState: vi.fn(),
              getLoginStateById: vi.fn().mockResolvedValue(mockLoginState),
              createAuthUser: vi.fn().mockResolvedValue(mockAuthUser),
              deleteLoginState: vi.fn().mockResolvedValue({}),
            },
          },
        ],
      }).compile();
      const adminStrategy = module.get<GithubStrategy>(GithubStrategy);
      const adminAuthService = module.get<Mocked<AuthService>>(AuthService);
      const request = { query: { state: 'state-id' } } as unknown as CurrentRequest;

      await adminStrategy.validate(request, 'access', 'refresh', mockProfile);

      expect(adminAuthService.createAuthUser).toHaveBeenCalledWith(mockProfile, true);
    });
  });

  describe('getAuthorizeUrl', () => {
    it('creates a login state and builds the authorize url from the oauth2 client', async () => {
      authService.createLoginState.mockResolvedValue('state-id');
      const getAuthorizeUrl = vi.fn().mockReturnValue('https://github.com/login/oauth/authorize?state=state-id');
      (strategy as unknown as { _oauth2: { getAuthorizeUrl: typeof getAuthorizeUrl } })._oauth2 = {
        getAuthorizeUrl,
      };
      const params: LoginStateParams = { data: { redirectUrl: '/home' } };

      const url = await strategy.getAuthorizeUrl(params);

      expect(authService.createLoginState).toHaveBeenCalledWith(params);
      expect(getAuthorizeUrl).toHaveBeenCalledWith({
        redirect_uri: 'https://app.example/callback',
        state: 'state-id',
        scope: ['user:email'],
      });
      expect(url).toBe('https://github.com/login/oauth/authorize?state=state-id');
    });
  });
});
