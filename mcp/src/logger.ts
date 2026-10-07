import { redactSecrets } from './redact.js';

export type LogLevel = 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

export type Logger = {
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
};

export type LoggerOptions = {
  /**
   * Where log lines go. MUST be stderr in stdio mode — stdout there carries the
   * JSON-RPC stream and any stray line corrupts the protocol.
   */
  write: (line: string) => void;
  /** Injected for tests. */
  now?: () => string;
};

/** Structured single-line JSON logger. Fields are scrubbed of secret-like keys. */
export function createLogger(options: LoggerOptions): Logger {
  const now = options.now ?? (() => new Date().toISOString());

  const log = (level: LogLevel, message: string, fields?: LogFields) => {
    const payload = { time: now(), level, msg: message, ...redactSecrets(fields ?? {}) };
    options.write(`${JSON.stringify(payload)}\n`);
  };

  return {
    info: (message, fields) => log('info', message, fields),
    warn: (message, fields) => log('warn', message, fields),
    error: (message, fields) => log('error', message, fields),
  };
}

/** Logger for the hosted HTTP server: stdout is free, container ships it to CloudWatch. */
export function createStdoutLogger(): Logger {
  return createLogger({ write: line => process.stdout.write(line) });
}

/** Logger for stdio mode: stdout belongs to JSON-RPC, so everything goes to stderr. */
export function createStderrLogger(): Logger {
  return createLogger({ write: line => process.stderr.write(line) });
}

/** Discards everything. Default for library use (tests, embedded usage). */
export const noopLogger: Logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};
