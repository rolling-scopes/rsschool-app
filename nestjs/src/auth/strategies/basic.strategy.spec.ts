import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { BasicStrategy } from './basic.strategy';
import { ConfigService } from 'src/config';
import { AuthUser } from '..';

const ROOT_USERNAME = 'root';
const ROOT_PASSWORD = 'root-password';

const mockConfig = {
  users: {
    root: { username: ROOT_USERNAME, password: ROOT_PASSWORD },
  },
} as Partial<ConfigService> as ConfigService;

describe('BasicStrategy', () => {
  let strategy: BasicStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasicStrategy, { provide: ConfigService, useValue: mockConfig }],
    }).compile();

    strategy = module.get<BasicStrategy>(BasicStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('returns an admin AuthUser for valid root credentials', async () => {
      const result = await strategy.validate(undefined, ROOT_USERNAME, ROOT_PASSWORD);

      expect(result).toBeInstanceOf(AuthUser);
      expect(result.isAdmin).toBe(true);
    });

    it('throws UnauthorizedException when the username does not match', async () => {
      await expect(strategy.validate(undefined, 'wrong-user', ROOT_PASSWORD)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      await expect(strategy.validate(undefined, ROOT_USERNAME, 'wrong-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when both username and password are wrong', async () => {
      await expect(strategy.validate(undefined, 'wrong-user', 'wrong-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('requires both fields to match (short-circuits when username matches but password differs)', async () => {
      // Exercises the && right-hand side: username equal, password not.
      await expect(strategy.validate(undefined, ROOT_USERNAME, '')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
