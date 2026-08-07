import { createHmac } from 'crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ActivityController } from 'src/activity/activity.controller';
import { ConfigService } from 'src/config';
import { UsersService } from 'src/users/users.service';
import { ADAPTERS, createHttpApp } from './harness';
import { testConfig, WEBHOOK_SECRET } from './fixtures';

function signPayload(payload: unknown): string {
  return `sha1=${createHmac('sha1', WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex')}`;
}

describe.each(ADAPTERS)('activity webhook HMAC over HTTP [%s]', adapter => {
  let app: INestApplication;
  const payload = { sender: { login: { githubId: 'octocat' } } };

  beforeAll(async () => {
    app = await createHttpApp(
      {
        controllers: [ActivityController],
        providers: [
          { provide: ConfigService, useValue: testConfig },
          {
            provide: UsersService,
            useValue: {
              getByGithubId: vi.fn().mockResolvedValue({ id: 1 }),
              updateUser: vi.fn().mockResolvedValue(undefined),
            },
          },
        ],
      },
      adapter,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a payload with a valid signature', async () => {
    const response = await request(app.getHttpServer())
      .post('/activity/webhook')
      .set('x-hub-signature', signPayload(payload))
      .send(payload)
      .expect(201);

    expect(response.body).toEqual({ isActive: true, lastActivityTime: expect.any(Number) });
  });

  it('rejects a tampered payload (valid-length signature) with 401', async () => {
    const tampered = { sender: { login: { githubId: 'imposter' } } };

    const response = await request(app.getHttpServer())
      .post('/activity/webhook')
      .set('x-hub-signature', signPayload(payload))
      .send(tampered)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: "Signatures didn't match",
      error: 'Unauthorized',
    });
  });

  it('rejects a missing signature header with 401', async () => {
    const response = await request(app.getHttpServer()).post('/activity/webhook').send(payload).expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'x-hub-signature is missing',
      error: 'Unauthorized',
    });
  });

  it('returns 500 for a signature of a different length (timingSafeEqual throws)', async () => {
    // Pins current behavior: crypto.timingSafeEqual throws a RangeError on
    // length mismatch and the catch-all filter turns it into a 500 — a known
    // latent quirk, kept as-is until fixed deliberately.
    const response = await request(app.getHttpServer())
      .post('/activity/webhook')
      .set('x-hub-signature', 'sha1=short')
      .send(payload)
      .expect(500);

    expect(response.body).toEqual({ statusCode: 500, message: 'Internal server error' });
  });

  it('rejects a payload with non-whitelisted properties with 400 (signature never checked)', async () => {
    const withExtra = { ...payload, extra: 'nope' };

    const response = await request(app.getHttpServer())
      .post('/activity/webhook')
      .set('x-hub-signature', signPayload(withExtra))
      .send(withExtra)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'property extra should not exist',
      error: 'Bad Request',
    });
  });
});
