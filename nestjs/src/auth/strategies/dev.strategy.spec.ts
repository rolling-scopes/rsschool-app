import { Test, TestingModule } from '@nestjs/testing';
import { DevStrategy } from './dev.strategy';
import { AuthService } from '../auth.service';
import { ConfigService } from '../../config';

const DEV_USERNAME = 'dev-user';

const mockConfig = {
  auth: { dev: { username: DEV_USERNAME, admin: true } },
} as Partial<ConfigService> as ConfigService;

const mockAuthUser = { id: 11, githubId: DEV_USERNAME, isAdmin: true };

const mockAuthService = {
  createAuthUser: vi.fn(),
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
    // Token minting and the cookie/redirect moved to the auth controller; the
    // strategy only authenticates the configured dev user.
    it('creates and returns the configured dev auth user', async () => {
      mockAuthService.createAuthUser.mockResolvedValue(mockAuthUser);

      const result = await strategy.validate();

      expect(mockAuthService.createAuthUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: DEV_USERNAME }),
        true,
      );
      expect(result).toBe(mockAuthUser);
    });
  });
});
