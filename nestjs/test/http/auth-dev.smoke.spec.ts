import { INestApplication } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { BasicStrategy } from 'src/auth/strategies/basic.strategy';
import { DevStrategy } from 'src/auth/strategies/dev.strategy';
import { GithubStrategy } from 'src/auth/strategies/github.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { ConfigService } from 'src/config';
import { ADAPTERS, createHttpApp } from './harness';
import { createTestUser, ROOT_PASSWORD, ROOT_USERNAME, testConfig } from './fixtures';

// NODE_ENV is not 'production' under vitest, so auth.controller's module-load
// `isDev` is true: the login/callback routes are guarded by the 'dev' strategy
// and cookies are set without a Domain attribute.
describe.each(ADAPTERS)('auth endpoints in dev mode [%s]', adapter => {
  let app: INestApplication;

  const authServiceMock = {
    createAuthUser: vi.fn().mockResolvedValue(createTestUser()),
    validateGithub: vi.fn().mockReturnValue('dev-jwt-token'),
    createLoginState: vi.fn().mockResolvedValue('state-123'),
    getRedirectUrl: vi.fn().mockReturnValue('/'),
    onConnectionComplete: vi.fn(),
    getAuthUser: vi.fn().mockResolvedValue(createTestUser()),
  };

  beforeAll(async () => {
    app = await createHttpApp(
      {
        controllers: [AuthController],
        providers: [
          DevStrategy,
          GithubStrategy,
          BasicStrategy,
          JwtStrategy,
          { provide: ConfigService, useValue: testConfig },
          { provide: AuthService, useValue: authServiceMock },
          { provide: CACHE_MANAGER, useValue: { get: vi.fn().mockResolvedValue(undefined), set: vi.fn() } },
        ],
      },
      adapter,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('dev login responds with a 302, the jwt cookie and a redirect to /', async () => {
    const response = await request(app.getHttpServer()).get('/auth/github/login').expect(302);

    // Pins the dev.strategy req.res.writeHead behavior byte-exact.
    expect(response.headers['set-cookie']).toEqual(['auth-token=dev-jwt-token; HttpOnly; path=/;']);
    expect(response.headers.location).toBe('/');
  });

  it('logout clears the cookie and redirects to /login', async () => {
    const response = await request(app.getHttpServer()).get('/auth/github/logout').expect(302);

    expect(response.headers['set-cookie']).toEqual(['auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
    expect(response.headers.location).toBe('/login');
  });

  it('github/connect returns the github authorize link for an admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/github/connect')
      .auth(ROOT_USERNAME, ROOT_PASSWORD)
      .send({ channelId: 'discord', externalId: '42' })
      .expect(201);

    const link = new URL(response.body.link);
    expect(link.origin).toBe('https://github.com');
    expect(link.pathname).toBe('/login/oauth/authorize');
    expect(link.searchParams.get('client_id')).toBe('test-client-id');
    expect(link.searchParams.get('redirect_uri')).toBe(testConfig.auth.github.callbackUrl);
    expect(link.searchParams.get('scope')).toBe('user:email');
    expect(link.searchParams.get('state')).toBe('state-123');
  });
});
