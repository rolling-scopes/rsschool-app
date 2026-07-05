import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../../config';
import { AuthService } from '../auth.service';
import { JWT_COOKIE_NAME } from '../constants';
import { AuthUser, JwtToken } from '../auth-user.model';

const SECRET = 'test-secret-key';

const mockConfig = {
  auth: { jwt: { secretKey: SECRET } },
} as Partial<ConfigService> as ConfigService;

const mockPayload: JwtToken = {
  id: 42,
  githubId: 'johndoe',
  isAdmin: false,
  isHirer: false,
};

const mockAuthUser = {
  id: 42,
  githubId: 'johndoe',
  isAdmin: false,
  isHirer: false,
} as AuthUser;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let cacheManager: Mocked<Cache>;
  let authService: Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfig },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getAuthUser: vi.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    cacheManager = module.get(CACHE_MANAGER);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('jwtFromRequest (token extraction)', () => {
    // The extractor is the function passed to passport-jwt via super();
    // passport-jwt stores it on the instance as `_jwtFromRequest`.
    const getExtractor = () =>
      (strategy as unknown as { _jwtFromRequest: (req: Request) => string | null })._jwtFromRequest;

    it('extracts the token from the auth cookie when present', () => {
      const req = {
        cookies: { [JWT_COOKIE_NAME]: 'cookie-token' },
        headers: {},
      } as unknown as Request;

      expect(getExtractor()(req)).toBe('cookie-token');
    });

    it('falls back to the Authorization bearer header when the cookie is absent', () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Bearer header-token' },
      } as unknown as Request;

      expect(getExtractor()(req)).toBe('header-token');
    });

    it('falls back to the bearer header when cookies object is undefined (?. short-circuit)', () => {
      const req = {
        headers: { authorization: 'Bearer header-token' },
      } as unknown as Request;

      expect(getExtractor()(req)).toBe('header-token');
    });

    it('returns null when neither cookie nor bearer header is present', () => {
      const req = {
        cookies: {},
        headers: {},
      } as unknown as Request;

      expect(getExtractor()(req)).toBeNull();
    });

    it('prefers the cookie over the bearer header when both are present', () => {
      const req = {
        cookies: { [JWT_COOKIE_NAME]: 'cookie-token' },
        headers: { authorization: 'Bearer header-token' },
      } as unknown as Request;

      expect(getExtractor()(req)).toBe('cookie-token');
    });
  });

  describe('validate', () => {
    it('returns the cached user on a cache hit without calling AuthService', async () => {
      cacheManager.get.mockResolvedValue(mockAuthUser);

      const result = await strategy.validate(mockPayload);

      expect(cacheManager.get).toHaveBeenCalledWith('auth-user-42');
      expect(authService.getAuthUser).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(result).toBe(mockAuthUser);
    });

    it('loads from AuthService and caches the user on a cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      authService.getAuthUser.mockResolvedValue(mockAuthUser);

      const result = await strategy.validate(mockPayload);

      expect(cacheManager.get).toHaveBeenCalledWith('auth-user-42');
      expect(authService.getAuthUser).toHaveBeenCalledWith('johndoe');
      expect(cacheManager.set).toHaveBeenCalledWith('auth-user-42', mockAuthUser, 1000 * 60 * 10);
      expect(result).toBe(mockAuthUser);
    });

    it('treats a null cached value as a miss and loads from AuthService', async () => {
      cacheManager.get.mockResolvedValue(null);
      authService.getAuthUser.mockResolvedValue(mockAuthUser);

      const result = await strategy.validate(mockPayload);

      expect(authService.getAuthUser).toHaveBeenCalledWith('johndoe');
      expect(result).toBe(mockAuthUser);
    });

    it('builds the cache key from the payload id', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      authService.getAuthUser.mockResolvedValue(mockAuthUser);

      await strategy.validate({ ...mockPayload, id: 7 });

      expect(cacheManager.get).toHaveBeenCalledWith('auth-user-7');
      expect(cacheManager.set).toHaveBeenCalledWith('auth-user-7', mockAuthUser, expect.any(Number));
    });

    it('propagates an AuthService rejection on a cache miss', async () => {
      const error = new Error('user not found');
      cacheManager.get.mockResolvedValue(undefined);
      authService.getAuthUser.mockRejectedValue(error);

      await expect(strategy.validate(mockPayload)).rejects.toThrow('user not found');
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
