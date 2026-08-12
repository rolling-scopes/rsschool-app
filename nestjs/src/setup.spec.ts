import { HttpAdapterHost } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { ConfigService } from './config';
import { createAdapter, setupApp } from './setup';

function createAppMock(host: string) {
  const enableCors = vi.fn();
  const register = vi.fn().mockResolvedValue(undefined);
  const app = {
    get: vi.fn((token: unknown) => {
      if (token === ConfigService) return { host };
      if (token === HttpAdapterHost) return { httpAdapter: {} };
      if (token === Logger) return { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
      return {};
    }),
    enableCors,
    useLogger: vi.fn(),
    register,
    useGlobalFilters: vi.fn(),
    useGlobalInterceptors: vi.fn(),
    useGlobalPipes: vi.fn(),
  } as unknown as NestFastifyApplication;

  return { app, enableCors, register };
}

describe('setupApp CORS', () => {
  it('scopes the origin to the app host and allows credentials (never wildcard)', async () => {
    const { app, enableCors } = createAppMock('https://app.rs.school');

    await setupApp(app);

    expect(enableCors).toHaveBeenCalledWith({ origin: 'https://app.rs.school', credentials: true });
    // Guard against a regression to the bare `enableCors()` (wildcard, no credentials).
    expect(enableCors).not.toHaveBeenCalledWith();
    const options = enableCors.mock.calls[0]?.[0];
    expect(options?.origin).not.toBe('*');
    expect(options?.credentials).toBe(true);
  });

  it('falls back to localhost when the host is unset', async () => {
    const { app, enableCors } = createAppMock('');

    await setupApp(app);

    expect(enableCors).toHaveBeenCalledWith({ origin: 'http://localhost:3000', credentials: true });
  });

  it('registers the cookie plugin (jwt strategy reads request.cookies)', async () => {
    const { app, register } = createAppMock('');

    await setupApp(app);

    expect(register).toHaveBeenCalledTimes(1);
  });
});

describe('createAdapter', () => {
  it('configures the fastify instance to match the legacy express behavior', () => {
    const adapter = createAdapter();
    const instance = adapter.getInstance();

    // 20mb body limit (jupyter notebook uploads) — fastify default is 1mb.
    expect(instance.initialConfig.bodyLimit).toBe(20 * 1024 * 1024);
    expect(instance.initialConfig.ignoreTrailingSlash).toBe(true);
    expect(instance.initialConfig.caseSensitive).toBe(false);
    // trustProxy is not exposed through initialConfig; its effect is covered
    // by the smoke suite running behind supertest's direct connection.
  });
});
