import { INestApplication } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import { AuthService } from 'src/auth/auth.service';
import { BasicStrategy } from 'src/auth/strategies/basic.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { ConfigService } from 'src/config';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';
import { RegistryController } from 'src/registry/registry.controller';
import { RegistryService } from 'src/registry/registry.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ADAPTERS, createHttpApp } from './harness';
import { createTestUser, ROOT_PASSWORD, ROOT_USERNAME, signTestJwt, testConfig } from './fixtures';

describe.each(ADAPTERS)('CSV download over HTTP [%s]', adapter => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createHttpApp(
      {
        controllers: [RegistryController],
        providers: [
          JwtStrategy,
          BasicStrategy,
          { provide: ConfigService, useValue: testConfig },
          { provide: AuthService, useValue: { getAuthUser: vi.fn().mockResolvedValue(createTestUser()) } },
          { provide: CACHE_MANAGER, useValue: { get: vi.fn().mockResolvedValue(undefined), set: vi.fn() } },
          {
            provide: RegistryService,
            useValue: {
              getMentorRegistriesForExport: vi.fn().mockResolvedValue([
                { githubId: 'alice', cityName: 'Minsk' },
                { githubId: 'bob', cityName: 'Warsaw' },
              ]),
            },
          },
          { provide: UserNotificationsService, useValue: {} },
          { provide: CoursesService, useValue: {} },
          { provide: DisciplinesService, useValue: {} },
        ],
      },
      adapter,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the mentors csv with exact headers and body for an admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/registry/mentors/csv')
      .auth(ROOT_USERNAME, ROOT_PASSWORD)
      .expect(200);

    // Header values are pinned byte-exact: the Fastify adapter swap must
    // reproduce them (including the disposition without `attachment;`).
    expect(response.headers['content-type']).toBe('text/csv');
    expect(response.headers['content-disposition']).toBe('filename="mentors.csv"');
    expect(response.text).toBe('"githubId","cityName"\n"alice","Minsk"\n"bob","Warsaw"');
  });

  it('rejects an unauthenticated request with 401', async () => {
    await request(app.getHttpServer()).get('/registry/mentors/csv').expect(401);
  });

  it('rejects a non-privileged user with a 403 json body', async () => {
    const response = await request(app.getHttpServer())
      .get('/registry/mentors/csv')
      .set('Cookie', `auth-token=${signTestJwt()}`)
      .expect(403);

    expect(response.body).toEqual({
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden',
    });
  });
});
