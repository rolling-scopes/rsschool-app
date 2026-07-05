import { Test, TestingModule } from '@nestjs/testing';
import { verify } from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { ConfigService } from '../../config';
import { AuthUser, JwtToken } from '../../auth/auth-user.model';

const SECRET = 'test-secret-key';

const mockAuthUser = {
  id: 42,
  githubId: 'johndoe',
  isAdmin: true,
  isHirer: false,
} as AuthUser;

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            auth: { jwt: { secretKey: SECRET } },
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('signs only the JwtToken fields and round-trips via verify', () => {
      const token = service.createToken(mockAuthUser);
      const decoded = verify(token, SECRET) as JwtToken & { exp: number; iat: number };

      expect(decoded).toMatchObject({
        id: 42,
        githubId: 'johndoe',
        isAdmin: true,
        isHirer: false,
      });
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('produces a token that fails verification with a wrong secret', () => {
      const token = service.createToken(mockAuthUser);

      expect(() => verify(token, 'other-secret')).toThrow();
    });
  });

  describe('createPublicCalendarToken', () => {
    it('signs an arbitrary serializable payload', () => {
      const token = service.createPublicCalendarToken({ courseId: 7, userId: 3 });
      const decoded = verify(token, SECRET) as { courseId: number; userId: number };

      expect(decoded).toMatchObject({ courseId: 7, userId: 3 });
    });

    it('strips non-serializable values through JSON round-trip', () => {
      const token = service.createPublicCalendarToken({ keep: 1, drop: undefined, fn: () => 1 });
      const decoded = verify(token, SECRET) as Record<string, unknown>;

      expect(decoded).toMatchObject({ keep: 1 });
      expect(decoded).not.toHaveProperty('drop');
      expect(decoded).not.toHaveProperty('fn');
    });
  });

  describe('validateToken', () => {
    it('returns the decoded payload for a valid token', () => {
      const token = service.createToken(mockAuthUser);

      const result = service.validateToken<JwtToken>(token);

      expect(result).toMatchObject({ id: 42, githubId: 'johndoe' });
    });

    it('throws for an invalid token', () => {
      expect(() => service.validateToken('not-a-jwt')).toThrow();
    });
  });
});
