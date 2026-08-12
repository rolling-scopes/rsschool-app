import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import type { Response } from 'superagent';
import { configureHttp } from 'src/setup';

/**
 * Adapters the smoke suite runs against. The Fastify migration (#1123) flips
 * this to ['express', 'fastify'] so every spec proves behavioral parity
 * between the two adapters before the swap ships.
 */
export const ADAPTERS = ['express'] as const;
export type AdapterName = (typeof ADAPTERS)[number];

export const TEST_HOST = 'http://localhost:3000';

function createAdapter(adapter: AdapterName) {
  switch (adapter) {
    case 'express':
      return new ExpressAdapter();
  }
}

/**
 * Boots a purpose-built testing module as a real HTTP application: the same
 * body/cookie parsing as the production bootstrap (src/setup.ts) plus the
 * shared configureHttp() wiring (CORS, filters, validation pipe). Controllers,
 * guards and passport strategies are real; services are mocked by the caller.
 */
export async function createHttpApp(metadata: ModuleMetadata, adapter: AdapterName): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication(createAdapter(adapter), { logger: false });

  // Mirrors the adapter-specific part of setupApp.
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
