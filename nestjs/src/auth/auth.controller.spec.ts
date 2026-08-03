import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AuthService } from '.';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { CurrentRequest } from './auth.service';
import { ConfigService } from '../config';

const mockAuthService = {
  createAuthUser: vi.fn(),
  validateGithub: vi.fn(),
  onConnectionComplete: vi.fn(),
  getRedirectUrl: vi.fn(),
  clearAuthUserSessionCache: vi.fn(),
};

const mockGithubStrategy = {
  getAuthorizeUrl: vi.fn(),
};

const mockHttpAdapter = {
  setHeader: vi.fn(),
  redirect: vi.fn(),
};

const createConfig = (isDev: boolean) =>
  ({
    isDev,
    auth: { dev: { username: 'dev-user', admin: true } },
  }) as Partial<ConfigService> as ConfigService;

async function createController({ isDev }: { isDev: boolean } = { isDev: false }): Promise<AuthController> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: GithubStrategy, useValue: mockGithubStrategy },
      { provide: ConfigService, useValue: createConfig(isDev) },
      { provide: HttpAdapterHost, useValue: { httpAdapter: mockHttpAdapter } },
    ],
    controllers: [AuthController],
  }).compile();

  return module.get<AuthController>(AuthController);
}

describe('AuthController', () => {
  beforeEach(() => {
    Object.values(mockAuthService).forEach(fn => fn.mockReset());
    Object.values(mockGithubStrategy).forEach(fn => fn.mockReset());
    Object.values(mockHttpAdapter).forEach(fn => fn.mockReset());
  });

  it('should be defined', async () => {
    expect(await createController()).toBeDefined();
  });

  describe('githubLogin', () => {
    it('in dev mode creates the dev user, sets the session cookie and redirects to /', async () => {
      const controller = await createController({ isDev: true });
      const devUser = { id: 11, githubId: 'dev-user' };
      mockAuthService.createAuthUser.mockResolvedValue(devUser);
      mockAuthService.validateGithub.mockReturnValue('dev-token');
      const req = { query: {} } as unknown as CurrentRequest;
      const res = {};

      await controller.githubLogin(req, res);

      expect(mockAuthService.createAuthUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'dev-user' }),
        true,
      );
      expect(req.user).toBe(devUser);
      expect(mockAuthService.validateGithub).toHaveBeenCalledWith(req);
      expect(mockHttpAdapter.setHeader).toHaveBeenCalledWith(
        res,
        'Set-Cookie',
        'auth-token=dev-token; Path=/; HttpOnly',
      );
      expect(mockHttpAdapter.redirect).toHaveBeenCalledWith(res, 302, '/');
      expect(mockGithubStrategy.getAuthorizeUrl).not.toHaveBeenCalled();
    });

    it('in dev mode throws when the minted token is falsy', async () => {
      const controller = await createController({ isDev: true });
      mockAuthService.createAuthUser.mockResolvedValue({ id: 11 });
      mockAuthService.validateGithub.mockReturnValue(null);
      const req = { query: {} } as unknown as CurrentRequest;

      await expect(controller.githubLogin(req, {})).rejects.toThrow('Invalid token');
      expect(mockHttpAdapter.setHeader).not.toHaveBeenCalled();
      expect(mockHttpAdapter.redirect).not.toHaveBeenCalled();
    });

    it('in prod mode redirects to the authorize url built from the request url', async () => {
      const controller = await createController({ isDev: false });
      mockGithubStrategy.getAuthorizeUrl.mockResolvedValue('https://github.com/login/oauth/authorize?state=state-id');
      const req = { query: { url: '/course/students' } } as unknown as CurrentRequest;
      const res = {};

      await controller.githubLogin(req, res);

      expect(mockGithubStrategy.getAuthorizeUrl).toHaveBeenCalledWith({
        data: { redirectUrl: '/course/students' },
        expires: expect.any(String),
      });
      expect(mockHttpAdapter.redirect).toHaveBeenCalledWith(
        res,
        302,
        'https://github.com/login/oauth/authorize?state=state-id',
      );
      expect(mockAuthService.createAuthUser).not.toHaveBeenCalled();
      expect(mockHttpAdapter.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('githubCallback', () => {
    it('sets the jwt cookie and redirects to the resolved url when there is no connection login state', async () => {
      const controller = await createController({ isDev: false });
      mockAuthService.validateGithub.mockReturnValue('jwt-token');
      mockAuthService.getRedirectUrl.mockReturnValue('/home');
      const req = { user: { id: 11 }, loginState: undefined } as unknown as CurrentRequest;
      const res = {};

      await controller.githubCallback(req, res);

      expect(mockAuthService.validateGithub).toHaveBeenCalledWith(req);
      expect(mockHttpAdapter.setHeader).toHaveBeenCalledWith(
        res,
        'Set-Cookie',
        expect.stringMatching(
          /^auth-token=jwt-token; Domain=rs\.school; Path=\/; Expires=.+; HttpOnly; Secure; SameSite=None$/,
        ),
      );
      expect(mockAuthService.getRedirectUrl).toHaveBeenCalledWith(undefined);
      expect(mockHttpAdapter.redirect).toHaveBeenCalledWith(res, 302, '/home');
      expect(mockAuthService.onConnectionComplete).not.toHaveBeenCalled();
    });

    it('completes a connection and redirects to the confirmation page when loginState has a channelId', async () => {
      const controller = await createController({ isDev: false });
      mockAuthService.validateGithub.mockReturnValue('jwt-token');
      mockAuthService.onConnectionComplete.mockResolvedValue(undefined);
      const loginState = { channelId: 'telegram', externalId: 'tg-1' };
      const req = { user: { id: 11 }, loginState } as unknown as CurrentRequest;
      const res = {};

      await controller.githubCallback(req, res);

      expect(mockAuthService.onConnectionComplete).toHaveBeenCalledWith(loginState, 11);
      expect(mockHttpAdapter.redirect).toHaveBeenCalledWith(
        res,
        302,
        '/profile/connection-confirmed?connectionType=telegram',
      );
      expect(mockAuthService.getRedirectUrl).not.toHaveBeenCalled();
    });

    it('logs and rethrows when token validation fails', async () => {
      const controller = await createController({ isDev: false });
      const error = new Error('boom');
      mockAuthService.validateGithub.mockImplementation(() => {
        throw error;
      });
      const req = { user: { id: 11 } } as unknown as CurrentRequest;

      await expect(controller.githubCallback(req, {})).rejects.toBe(error);
      expect(mockHttpAdapter.setHeader).not.toHaveBeenCalled();
      expect(mockHttpAdapter.redirect).not.toHaveBeenCalled();
    });
  });

  describe('githubLogout', () => {
    it('clears the jwt cookie and redirects to the login page', async () => {
      const controller = await createController({ isDev: false });
      const res = {};

      controller.githubLogout(res);

      expect(mockHttpAdapter.setHeader).toHaveBeenCalledWith(
        res,
        'Set-Cookie',
        'auth-token=; Domain=rs.school; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
      expect(mockHttpAdapter.redirect).toHaveBeenCalledWith(res, 302, '/login');
    });
  });

  describe('createConnectLinkViaGithub', () => {
    it('builds an authorize url from the dto and returns it wrapped in a link', async () => {
      const controller = await createController();
      const dto = { channelId: 'telegram', externalId: 'tg-1' } as never;
      mockGithubStrategy.getAuthorizeUrl.mockResolvedValue('https://gh/authorize');

      const result = await controller.createConnectLinkViaGithub(dto);

      expect(mockGithubStrategy.getAuthorizeUrl).toHaveBeenCalledWith(
        expect.objectContaining({ data: dto, expires: expect.any(String) }),
      );
      expect(result).toEqual({ link: 'https://gh/authorize' });
    });
  });

  describe('clearAuthUserSessionCache', () => {
    it('clears the cache for the current user', async () => {
      const controller = await createController();
      const req = { user: { id: 11 } } as unknown as CurrentRequest;
      mockAuthService.clearAuthUserSessionCache.mockResolvedValue(undefined);

      await controller.clearAuthUserSessionCache(11, req);

      expect(mockAuthService.clearAuthUserSessionCache).toHaveBeenCalledWith(11);
    });

    it('throws ForbiddenException when clearing another user cache', async () => {
      const controller = await createController();
      const req = { user: { id: 11 } } as unknown as CurrentRequest;

      await expect(controller.clearAuthUserSessionCache(99, req)).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockAuthService.clearAuthUserSessionCache).not.toHaveBeenCalled();
    });
  });
});
