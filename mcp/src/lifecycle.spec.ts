import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createHttpServer,
  HEADERS_TIMEOUT_MS,
  installShutdownHandlers,
  KEEP_ALIVE_TIMEOUT_MS,
  type ShutdownLogger,
} from './lifecycle.js';

function makeLogger(): ShutdownLogger & { infos: string[]; errors: string[] } {
  const infos: string[] = [];
  const errors: string[] = [];
  return { infos, errors, info: message => void infos.push(message), error: message => void errors.push(message) };
}

const disposers: Array<() => void> = [];

afterEach(() => {
  while (disposers.length) {
    disposers.pop()?.();
  }
});

describe('createHttpServer', () => {
  it('sets keep-alive above the upstream idle timeout, headers above that', () => {
    const server = createHttpServer((_req, res) => res.end());
    expect(server.keepAliveTimeout).toBe(KEEP_ALIVE_TIMEOUT_MS);
    expect(server.headersTimeout).toBe(HEADERS_TIMEOUT_MS);
    expect(server.headersTimeout).toBeGreaterThan(server.keepAliveTimeout);
    server.close();
  });
});

describe('installShutdownHandlers', () => {
  it('closes the server and exits 0 on SIGTERM', async () => {
    const server = createHttpServer((_req, res) => res.end());
    await new Promise<void>(resolve => server.listen(0, resolve));
    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit }));

    process.emit('SIGTERM');
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0));
    expect(logger.infos).toContain('shutdown started');
    expect(logger.infos).toContain('shutdown complete');
  });

  it('ignores a second signal while already shutting down', async () => {
    const server = createHttpServer((_req, res) => res.end());
    await new Promise<void>(resolve => server.listen(0, resolve));
    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit }));

    process.emit('SIGTERM');
    process.emit('SIGINT');
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0));
    expect(logger.infos.filter(message => message === 'shutdown started')).toHaveLength(1);
  });

  it('exits 1 when the server fails to close', async () => {
    const server = createHttpServer((_req, res) => res.end());
    // Never listened: close() reports ERR_SERVER_NOT_RUNNING.
    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit }));

    process.emit('SIGINT');
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
    expect(logger.errors).toContain('shutdown failed');
  });

  it('forces an exit when draining exceeds the grace period', async () => {
    // A request that never completes: closeIdleConnections() can't reap it, so
    // close() stays pending and the grace timer must fire.
    let hangingResponse: { end: () => void } | undefined;
    const server = createHttpServer((_req, res) => {
      hangingResponse = res;
    });
    await new Promise<void>(resolve => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    const pending = fetch(`http://127.0.0.1:${port}/`).catch(() => undefined);
    await vi.waitFor(() => expect(hangingResponse).toBeDefined());

    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit, graceMs: 10 }));

    process.emit('SIGTERM');
    await vi.waitFor(() => expect(logger.errors).toContain('shutdown timed out, forcing exit'));
    expect(exit).toHaveBeenCalledWith(1);

    hangingResponse?.end();
    await pending;
    server.close();
  });

  it('logs an unhandled rejection without exiting', async () => {
    const server = createHttpServer((_req, res) => res.end());
    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit }));

    process.emit('unhandledRejection', new Error('stray'), Promise.resolve());
    process.emit('unhandledRejection', 'plain string', Promise.resolve());
    expect(logger.errors.filter(message => message === 'unhandled rejection')).toHaveLength(2);
    expect(exit).not.toHaveBeenCalled();
  });

  it('shuts down on an uncaught exception', async () => {
    const server = createHttpServer((_req, res) => res.end());
    await new Promise<void>(resolve => server.listen(0, resolve));
    const logger = makeLogger();
    const exit = vi.fn();
    disposers.push(installShutdownHandlers({ server, logger, exit }));

    process.emit('uncaughtException', new Error('boom'));
    await vi.waitFor(() => expect(exit).toHaveBeenCalled());
    expect(logger.errors).toContain('uncaught exception');
  });

  it('detaches its process listeners when disposed', () => {
    const server = createHttpServer((_req, res) => res.end());
    const before = process.listenerCount('SIGTERM');
    const dispose = installShutdownHandlers({ server, logger: makeLogger(), exit: vi.fn() });
    expect(process.listenerCount('SIGTERM')).toBe(before + 1);
    dispose();
    expect(process.listenerCount('SIGTERM')).toBe(before);
    server.close();
  });
});

describe('installShutdownHandlers default exit', () => {
  it('uses process.exit when no exit function is injected', async () => {
    const server = createHttpServer((_req, res) => res.end());
    await new Promise<void>(resolve => server.listen(0, resolve));
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    disposers.push(installShutdownHandlers({ server, logger: makeLogger() }));

    process.emit('SIGTERM');
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0));
    exit.mockRestore();
  });
});
