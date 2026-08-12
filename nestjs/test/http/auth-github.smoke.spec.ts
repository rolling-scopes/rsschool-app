import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADAPTERS, createHttpApp } from './harness';
import { createTestUser, testConfig } from './fixtures';

/**
 * Production-mode auth flow: the callback guard's strategy name is a
 * module-load constant, so the module graph is re-imported with
 * NODE_ENV=production to get the real 'github' guard; everything else
 * (cookie domain, dev-login shortcut) derives from ConfigService.isDev, so the
 * shared testConfig is overridden with isDev:false. These pins are the
 * contract the Fastify migration (#1123) must reproduce.
 */
describe.each(ADAPTERS)('github oauth in production mode [%s]', adapter => {
  const prodConfig = { ...testConfig, isDev: false } as typeof testConfig;

  // Fresh module graph (created in beforeAll after NODE_ENV is stubbed).
  let modules: {
    AuthController: typeof import('src/auth/auth.controller').AuthController;
    AuthService: typeof import('src/auth/auth.service').AuthService;
    GithubStrategy: typeof import('src/auth/strategies/github.strategy').GithubStrategy;
    ConfigService: typeof import('src/config').ConfigService;
    passport: typeof import('passport');
  };

  const authServiceMock = {
    createAuthUser: vi.fn(),
    validateGithub: vi.fn().mockReturnValue('prod-jwt-token'),
    createLoginState: vi.fn().mockResolvedValue('state-456'),
    getRedirectUrl: vi.fn((loginState?: { redirectUrl?: string }) => loginState?.redirectUrl ?? '/'),
    onConnectionComplete: vi.fn(),
  };

  beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    modules = {
      AuthController: (await import('src/auth/auth.controller')).AuthController,
      AuthService: (await import('src/auth/auth.service')).AuthService,
      GithubStrategy: (await import('src/auth/strategies/github.strategy')).GithubStrategy,
      ConfigService: (await import('src/config')).ConfigService,
      passport: await import('passport'),
    };
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('login initiation (real passport-github2 redirect)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await createHttpApp(
        {
          controllers: [modules.AuthController],
          providers: [
            modules.GithubStrategy,
            { provide: modules.ConfigService, useValue: prodConfig },
            { provide: modules.AuthService, useValue: authServiceMock },
          ],
        },
        adapter,
      );
    });

    afterAll(async () => {
      await app.close();
    });

    it('redirects to the github authorize url with the login state', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/github/login?url=%2Fcourse%2Fstudents')
        .expect(302);

      const location = new URL(response.headers.location as string);
      expect(location.origin).toBe('https://github.com');
      expect(location.pathname).toBe('/login/oauth/authorize');
      expect(location.searchParams.get('response_type')).toBe('code');
      expect(location.searchParams.get('client_id')).toBe('test-client-id');
      expect(location.searchParams.get('redirect_uri')).toBe(testConfig.auth.github.callbackUrl);
      expect(location.searchParams.get('scope')).toBe('user:email');
      expect(location.searchParams.get('state')).toBe('state-456');

      expect(authServiceMock.createLoginState).toHaveBeenCalledWith({
        data: { redirectUrl: '/course/students' },
        expires: expect.any(String),
      });
    });

    it('logout clears the rs.school-scoped cookie and redirects to /login', async () => {
      const response = await request(app.getHttpServer()).get('/auth/github/logout').expect(302);

      expect(response.headers['set-cookie']).toEqual([
        'auth-token=; Domain=rs.school; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
      expect(response.headers.location).toBe('/login');
    });
  });

  describe('callback (github strategy stubbed at the passport registry)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      // Replace the 'github' strategy registered by the previous app so the
      // callback never talks to the real github token endpoint. The stub does
      // what the real strategy does on success: sets loginState and the user.
      modules.passport.use('github', {
        name: 'github',
        authenticate(this: { success: (user: unknown) => void }, req: { loginState?: unknown }) {
          req.loginState = { redirectUrl: '/after-login' };
          this.success(createTestUser());
        },
      } as never);

      app = await createHttpApp(
        {
          controllers: [modules.AuthController],
          providers: [
            { provide: modules.GithubStrategy, useValue: {} },
            { provide: modules.ConfigService, useValue: prodConfig },
            { provide: modules.AuthService, useValue: authServiceMock },
          ],
        },
        adapter,
      );
    });

    afterAll(async () => {
      await app.close();
    });

    it('sets the jwt cookie byte-exact and redirects to the login state url', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/github/callback?code=abc&state=state-456')
        .expect(302);

      const [cookie] = response.headers['set-cookie'] as unknown as string[];
      expect(cookie).toMatch(
        /^auth-token=prod-jwt-token; Domain=rs\.school; Path=\/; Expires=[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT; HttpOnly; Secure; SameSite=None$/,
      );
      expect(response.headers.location).toBe('/after-login');
    });
  });
});
