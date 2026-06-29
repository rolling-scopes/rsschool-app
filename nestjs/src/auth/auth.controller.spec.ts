import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from '.';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { CurrentRequest } from './auth.service';
import { JWT_COOKIE_NAME } from './constants';

const mockAuthService = {
  validateGithub: vi.fn(),
  onConnectionComplete: vi.fn(),
  getRedirectUrl: vi.fn(),
  clearAuthUserSessionCache: vi.fn(),
};

const mockGithubStrategy = {
  getAuthorizeUrl: vi.fn(),
};

const createRes = () => ({
  cookie: vi.fn(),
  clearCookie: vi.fn(),
  redirect: vi.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    Object.values(mockAuthService).forEach(fn => fn.mockReset());
    Object.values(mockGithubStrategy).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GithubStrategy, useValue: mockGithubStrategy },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('githubLogin', () => {
    it('is a no-op handler whose access is gated by the auth guard', () => {
      expect(controller.githubLogin()).toBeUndefined();
    });
  });

  describe('githubCallback', () => {
    it('sets the jwt cookie and redirects to the resolved url when there is no connection login state', async () => {
      mockAuthService.validateGithub.mockReturnValue('jwt-token');
      mockAuthService.getRedirectUrl.mockReturnValue('/home');
      const req = { user: { id: 11 }, loginState: undefined } as unknown as CurrentRequest;
      const res = createRes();

      await controller.githubCallback(req, res as never);

      expect(mockAuthService.validateGithub).toHaveBeenCalledWith(req);
      expect(res.cookie).toHaveBeenCalledWith(
        JWT_COOKIE_NAME,
        'jwt-token',
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'none' }),
      );
      expect(mockAuthService.getRedirectUrl).toHaveBeenCalledWith(undefined);
      expect(res.redirect).toHaveBeenCalledWith('/home');
      expect(mockAuthService.onConnectionComplete).not.toHaveBeenCalled();
    });

    it('completes a connection and redirects to the confirmation page when loginState has a channelId', async () => {
      mockAuthService.validateGithub.mockReturnValue('jwt-token');
      mockAuthService.onConnectionComplete.mockResolvedValue(undefined);
      const loginState = { channelId: 'telegram', externalId: 'tg-1' };
      const req = { user: { id: 11 }, loginState } as unknown as CurrentRequest;
      const res = createRes();

      await controller.githubCallback(req, res as never);

      expect(mockAuthService.onConnectionComplete).toHaveBeenCalledWith(loginState, 11);
      expect(res.redirect).toHaveBeenCalledWith('/profile/connection-confirmed?connectionType=telegram');
      expect(mockAuthService.getRedirectUrl).not.toHaveBeenCalled();
    });

    it('logs and rethrows when token validation fails', async () => {
      const error = new Error('boom');
      mockAuthService.validateGithub.mockImplementation(() => {
        throw error;
      });
      const req = { user: { id: 11 } } as unknown as CurrentRequest;
      const res = createRes();

      await expect(controller.githubCallback(req, res as never)).rejects.toBe(error);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('githubLogout', () => {
    it('clears the jwt cookie and redirects to the login page', () => {
      const res = createRes();

      controller.githubLogout(res as never);

      expect(res.clearCookie).toHaveBeenCalledWith(JWT_COOKIE_NAME, expect.objectContaining({ path: '/' }));
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('createConnectLinkViaGithub', () => {
    it('builds an authorize url from the dto and returns it wrapped in a link', async () => {
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
      const req = { user: { id: 11 } } as unknown as CurrentRequest;
      mockAuthService.clearAuthUserSessionCache.mockResolvedValue(undefined);

      await controller.clearAuthUserSessionCache(11, req);

      expect(mockAuthService.clearAuthUserSessionCache).toHaveBeenCalledWith(11);
    });

    it('throws ForbiddenException when clearing another user cache', async () => {
      const req = { user: { id: 11 } } as unknown as CurrentRequest;

      await expect(controller.clearAuthUserSessionCache(99, req)).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockAuthService.clearAuthUserSessionCache).not.toHaveBeenCalled();
    });
  });
});
