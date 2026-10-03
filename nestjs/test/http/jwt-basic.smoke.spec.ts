import { INestApplication } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import { ActivityController } from 'src/activity/activity.controller';
import { AuthService } from 'src/auth/auth.service';
import { BasicStrategy } from 'src/auth/strategies/basic.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { ConfigService } from 'src/config';
import { UsersService } from 'src/users/users.service';
import { ADAPTERS, createHttpApp } from './harness';
import { apiTokenProviders, createTestUser, ROOT_PASSWORD, ROOT_USERNAME, signTestJwt, testConfig } from './fixtures';

const lastActivityTime = 1700000000000;

describe.each(ADAPTERS)('DefaultGuard (jwt + basic) over HTTP [%s]', adapter => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createHttpApp(
      {
        controllers: [ActivityController],
        providers: [
          JwtStrategy,
          BasicStrategy,
          ...apiTokenProviders,
          { provide: ConfigService, useValue: testConfig },
          { provide: AuthService, useValue: { getAuthUser: vi.fn().mockResolvedValue(createTestUser()) } },
          {
            provide: UsersService,
            useValue: {
              getUserByUserId: vi.fn().mockResolvedValue({ id: 1, isActive: true, lastActivityTime }),
              updateUser: vi.fn().mockResolvedValue(undefined),
            },
          },
          { provide: CACHE_MANAGER, useValue: { get: vi.fn().mockResolvedValue(undefined), set: vi.fn() } },
        ],
      },
      adapter,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('authenticates with a valid jwt in the auth-token cookie', async () => {
    const response = await request(app.getHttpServer())
      .get('/activity')
      .set('Cookie', `auth-token=${signTestJwt()}`)
      .expect(200);

    expect(response.body).toEqual({ isActive: true, lastActivityTime });
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('authenticates with a valid jwt as a bearer token', async () => {
    await request(app.getHttpServer()).get('/activity').set('Authorization', `Bearer ${signTestJwt()}`).expect(200);
  });

  it('rejects a malformed jwt cookie with a 401 json body', async () => {
    const response = await request(app.getHttpServer())
      .get('/activity')
      .set('Cookie', 'auth-token=not-a-jwt')
      .expect(401);

    expect(response.body).toEqual({ statusCode: 401, message: 'Unauthorized' });
  });

  it('rejects an expired jwt with 401', async () => {
    const token = signTestJwt({}, { expiresIn: '-1h' });
    await request(app.getHttpServer()).get('/activity').set('Cookie', `auth-token=${token}`).expect(401);
  });

  it('rejects a request without credentials with 401', async () => {
    const response = await request(app.getHttpServer()).get('/activity').expect(401);

    expect(response.body).toEqual({ statusCode: 401, message: 'Unauthorized' });
  });

  it('authenticates with basic auth root credentials', async () => {
    const response = await request(app.getHttpServer()).get('/activity').auth(ROOT_USERNAME, ROOT_PASSWORD).expect(200);

    expect(response.body).toEqual({ isActive: true, lastActivityTime });
  });

  it('rejects wrong basic auth credentials with 401', async () => {
    await request(app.getHttpServer()).get('/activity').auth(ROOT_USERNAME, 'wrong-password').expect(401);
  });
});
