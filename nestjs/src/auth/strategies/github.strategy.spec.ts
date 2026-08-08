import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
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

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  // The `authenticate` override is gone: the login-initiation flow (login
  // state creation + authorize redirect) now lives in the auth controller and
  // is covered by auth.controller.spec.ts / the http smoke suite.

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
        response_type: 'code',
        redirect_uri: 'https://app.example/callback',
        state: 'state-id',
        scope: ['user:email'],
      });
      expect(url).toBe('https://github.com/login/oauth/authorize?state=state-id');
    });
  });
});
