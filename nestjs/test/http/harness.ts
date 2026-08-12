import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import fastifyCookie from '@fastify/cookie';
import { json } from 'express';
import type { Response } from 'superagent';
import { configureHttp, createAdapter } from 'src/setup';

/**
 * The parity suite runs every smoke spec against both adapters: 'fastify' is
 * what production runs (#1123), 'express' is the reference the pins were
 * recorded against. The express leg goes away together with the
 * @nestjs/platform-express dependency.
 */
export const ADAPTERS = ['express', 'fastify'] as const;
export type AdapterName = (typeof ADAPTERS)[number];

export const TEST_HOST = 'http://localhost:3000';

/**
 * Boots a purpose-built testing module as a real HTTP application with the
 * same request plumbing as the production bootstrap (src/setup.ts) plus the
 * shared configureHttp() wiring (CORS, interceptors, filters, validation
 * pipe). Controllers, guards and passport strategies are real; services are
 * mocked by the caller.
 */
export async function createHttpApp(metadata: ModuleMetadata, adapter: AdapterName): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule(metadata).compile();

  if (adapter === 'fastify') {
    const app = moduleRef.createNestApplication<NestFastifyApplication>(createAdapter(), { logger: false });
    await app.register(fastifyCookie);
    configureHttp(app, { host: TEST_HOST, logger: { warn: () => undefined } });
    await app.init();
    // Fastify queues requests until the instance is ready; supertest talks to
    // the raw node server, so readiness must be awaited explicitly.
    await app.getHttpAdapter().getInstance().ready();
    return app;
  }

  const app = moduleRef.createNestApplication(new ExpressAdapter(), { logger: false });
  app.use(cookieParser());
  app.use(json({ limit: '20mb' }));
  configureHttp(app, { host: TEST_HOST, logger: { warn: () => undefined } });
  await app.init();
  return app;
}

/** superagent does not buffer unknown content types (e.g. application/pdf). */
export function binaryParser(res: Response, callback: (err: Error | null, body: Buffer) => void) {
  const chunks: Buffer[] = [];
  res.on('data', (chunk: Buffer) => chunks.push(chunk));
  res.on('end', () => callback(null, Buffer.concat(chunks)));
}
