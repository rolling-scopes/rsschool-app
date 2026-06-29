import { Test, TestingModule } from '@nestjs/testing';
import { DevStrategy } from './dev.strategy';
import { AuthService, CurrentRequest } from '../auth.service';
import { ConfigService } from '../../config';
import { JWT_COOKIE_NAME } from '../constants';

const DEV_USERNAME = 'dev-user';

const mockConfig = {
  auth: { dev: { username: DEV_USERNAME, admin: true } },
} as Partial<ConfigService> as ConfigService;

const mockAuthUser = { id: 11, githubId: DEV_USERNAME, isAdmin: true };

const mockAuthService = {
  createAuthUser: vi.fn(),
  validateGithub: vi.fn(),
};

describe('DevStrategy', () => {
  let strategy: DevStrategy;

  beforeEach(async () => {
    Object.values(mockAuthService).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    strategy = module.get<DevStrategy>(DevStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('creates the dev auth user, sets a redirect cookie header and returns true on a valid token', async () => {
      mockAuthService.createAuthUser.mockResolvedValue(mockAuthUser);
      mockAuthService.validateGithub.mockReturnValue('dev-token');
      const writeHead = vi.fn();
      const req = { res: { writeHead } } as unknown as CurrentRequest;

      const result = await strategy.validate(req);

      expect(mockAuthService.createAuthUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: DEV_USERNAME }),
        true,
      );
      expect(req.user).toBe(mockAuthUser);
      expect(mockAuthService.validateGithub).toHaveBeenCalledWith(req);
      expect(writeHead).toHaveBeenCalledWith(
        302,
        expect.objectContaining({
          'Set-Cookie': `${JWT_COOKIE_NAME}=dev-token; HttpOnly; path=/;`,
          Location: '/',
        }),
      );
      expect(result).toBe(true);
    });

    it('throws when the generated token is falsy', async () => {
      mockAuthService.createAuthUser.mockResolvedValue(mockAuthUser);
      mockAuthService.validateGithub.mockReturnValue(null);
      const writeHead = vi.fn();
      const req = { res: { writeHead } } as unknown as CurrentRequest;

      await expect(strategy.validate(req)).rejects.toThrow('Invalid token');
      expect(writeHead).not.toHaveBeenCalled();
    });

    it('tolerates a missing response object via optional chaining', async () => {
      mockAuthService.createAuthUser.mockResolvedValue(mockAuthUser);
      mockAuthService.validateGithub.mockReturnValue('dev-token');
      const req = {} as unknown as CurrentRequest;

      const result = await strategy.validate(req);

      expect(result).toBe(true);
    });
  });
});
