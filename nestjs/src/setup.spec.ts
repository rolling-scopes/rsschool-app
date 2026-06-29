import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ConfigService } from './config';
import { setupApp } from './setup';

function createAppMock(host: string) {
  const enableCors = vi.fn();
  const app = {
    get: vi.fn((token: unknown) => {
      if (token === ConfigService) return { host };
      if (token === HttpAdapterHost) return { httpAdapter: {} };
      if (token === Logger) return { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
      return {};
    }),
    enableCors,
    useLogger: vi.fn(),
    use: vi.fn(),
    useGlobalFilters: vi.fn(),
    useGlobalPipes: vi.fn(),
  } as unknown as INestApplication;

  return { app, enableCors };
}

describe('setupApp CORS', () => {
  it('scopes the origin to the app host and allows credentials (never wildcard)', () => {
    const { app, enableCors } = createAppMock('https://app.rs.school');

    setupApp(app);

    expect(enableCors).toHaveBeenCalledWith({ origin: 'https://app.rs.school', credentials: true });
    // Guard against a regression to the bare `enableCors()` (wildcard, no credentials).
    expect(enableCors).not.toHaveBeenCalledWith();
    const options = enableCors.mock.calls[0]?.[0];
    expect(options?.origin).not.toBe('*');
    expect(options?.credentials).toBe(true);
  });

  it('falls back to localhost when the host is unset', () => {
    const { app, enableCors } = createAppMock('');

    setupApp(app);

    expect(enableCors).toHaveBeenCalledWith({ origin: 'http://localhost:3000', credentials: true });
  });
});
