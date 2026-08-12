import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import request from 'supertest';
import { EntityNotFoundError } from 'typeorm';
import { ValidationException } from 'src/core/validation';
import { ADAPTERS, createHttpApp, TEST_HOST } from './harness';

class EchoDto {
  @IsString()
  public name: string;
}

@Controller('smoke')
class SmokeController {
  @Get('ok')
  public ok() {
    return { ok: true };
  }

  @Get('entity-not-found')
  public entityNotFound() {
    throw new EntityNotFoundError('User', {});
  }

  @Get('validation-exception')
  public validationException() {
    throw new ValidationException(['first error', 'second error']);
  }

  @Post('echo')
  public echo(@Body() dto: EchoDto) {
    return dto;
  }
}

describe.each(ADAPTERS)('error shapes and CORS over HTTP [%s]', adapter => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createHttpApp({ controllers: [SmokeController] }, adapter);
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a plain json route', async () => {
    const response = await request(app.getHttpServer()).get('/smoke/ok').expect(200);

    expect(response.body).toEqual({ ok: true });
  });

  it('sets Cache-Control: no-cache on GET responses only', async () => {
    const getResponse = await request(app.getHttpServer()).get('/smoke/ok').expect(200);
    expect(getResponse.headers['cache-control']).toBe('no-cache');

    const postResponse = await request(app.getHttpServer()).post('/smoke/echo').send({ name: 'ok' }).expect(201);
    expect(postResponse.headers['cache-control']).toBeUndefined();
  });

  it('returns the EntityNotFoundFilter 404 body shape', async () => {
    const response = await request(app.getHttpServer()).get('/smoke/entity-not-found').expect(404);

    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ statusCode: 404, message: 'Not Found' });
  });

  it('returns the ValidationFilter 400 body shape', async () => {
    const response = await request(app.getHttpServer()).get('/smoke/validation-exception').expect(400);

    expect(response.body).toEqual({ statusCode: 400, errors: ['first error', 'second error'] });
  });

  it('returns the global ValidationPipe 400 body shape', async () => {
    const response = await request(app.getHttpServer()).post('/smoke/echo').send({ name: 42 }).expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'name must be a string',
      error: 'Bad Request',
    });
  });

  it('rejects non-whitelisted properties with 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/smoke/echo')
      .send({ name: 'ok', extra: 'nope' })
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'property extra should not exist',
      error: 'Bad Request',
    });
  });

  it('treats an empty json body as an empty object (fails dto validation)', async () => {
    // Express (body-parser) parses an empty body as {}. Fastify instead fails
    // with FST_ERR_CTP_EMPTY_JSON_BODY — this pin is the tripwire for that
    // divergence at adapter-swap time.
    const response = await request(app.getHttpServer())
      .post('/smoke/echo')
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'name must be a string',
      error: 'Bad Request',
    });
  });

  it('returns 400 for malformed json', async () => {
    const response = await request(app.getHttpServer())
      .post('/smoke/echo')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
  });

  it('returns the framework 404 body for an unknown route', async () => {
    const response = await request(app.getHttpServer()).get('/nope').expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Cannot GET /nope',
      error: 'Not Found',
    });
  });

  it('answers a CORS preflight with the configured origin and credentials', async () => {
    const response = await request(app.getHttpServer())
      .options('/smoke/ok')
      .set('Origin', TEST_HOST)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(TEST_HOST);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers.vary).toContain('Origin');
  });

  it('sets CORS headers on an actual cross-origin response', async () => {
    const response = await request(app.getHttpServer()).get('/smoke/ok').set('Origin', TEST_HOST).expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(TEST_HOST);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
