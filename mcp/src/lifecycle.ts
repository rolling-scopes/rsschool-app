import { createServer, type RequestListener, type Server } from 'node:http';

/**
 * nginx in front of us uses `proxy_read_timeout 120s`. Node's default
 * keepAliveTimeout of 5s is shorter than the upstream idle timeout, which is
 * the classic source of sporadic 502s: nginx reuses a connection that Node has
 * just closed. Keep ours comfortably longer, and headersTimeout above it as
 * Node requires.
 */
export const KEEP_ALIVE_TIMEOUT_MS = 130_000;
export const HEADERS_TIMEOUT_MS = 140_000;

/** How long in-flight requests get to finish after SIGTERM before we exit anyway. */
export const SHUTDOWN_GRACE_MS = 10_000;

export type ShutdownLogger = {
  info: (message: string, fields?: Record<string, unknown>) => void;
  error: (message: string, fields?: Record<string, unknown>) => void;
};

export function createHttpServer(listener: RequestListener): Server {
  const server = createServer(listener);
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;
  server.headersTimeout = HEADERS_TIMEOUT_MS;
  return server;
}

export type ShutdownOptions = {
  server: Server;
  logger: ShutdownLogger;
  graceMs?: number;
  /** Injected for tests; defaults to `process.exit`. */
  exit?: (code: number) => void;
};

/**
 * Stops accepting new connections and lets in-flight requests drain, then
 * exits. Without this the container is SIGKILLed after the compose grace
 * period and every tool call in flight is dropped mid-response.
 *
 * Returns a dispose function so tests can detach the listeners.
 */
export function installShutdownHandlers(options: ShutdownOptions): () => void {
  const { server, logger, graceMs = SHUTDOWN_GRACE_MS } = options;
  const exit = options.exit ?? ((code: number) => process.exit(code));
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info('shutdown started', { signal });

    const force = setTimeout(() => {
      logger.error('shutdown timed out, forcing exit', { signal, graceMs });
      exit(1);
    }, graceMs);
    // Don't let the timer itself keep the process alive once the server closed.
    force.unref?.();

    server.close(err => {
      clearTimeout(force);
      if (err) {
        logger.error('shutdown failed', { signal, error: err.message });
        exit(1);
        return;
      }
      logger.info('shutdown complete', { signal });
      exit(0);
    });
    // Idle keep-alive sockets would otherwise hold `close` open for the full grace period.
    server.closeIdleConnections?.();
  };

  const onSigterm = () => shutdown('SIGTERM');
  const onSigint = () => shutdown('SIGINT');
  const onRejection = (reason: unknown) => {
    logger.error('unhandled rejection', { error: reason instanceof Error ? reason.message : String(reason) });
  };
  const onException = (err: Error) => {
    logger.error('uncaught exception', { error: err.message });
    shutdown('uncaughtException');
  };

  process.on('SIGTERM', onSigterm);
  process.on('SIGINT', onSigint);
  process.on('unhandledRejection', onRejection);
  process.on('uncaughtException', onException);

  return () => {
    process.off('SIGTERM', onSigterm);
    process.off('SIGINT', onSigint);
    process.off('unhandledRejection', onRejection);
    process.off('uncaughtException', onException);
  };
}
