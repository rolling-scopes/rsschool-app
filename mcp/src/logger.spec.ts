import { describe, expect, it, vi } from 'vitest';
import { createLogger, createStderrLogger, createStdoutLogger, noopLogger } from './logger.js';

function collect() {
  const lines: string[] = [];
  const logger = createLogger({ write: line => lines.push(line), now: () => '2026-07-20T00:00:00.000Z' });
  return { logger, lines, parsed: () => lines.map(line => JSON.parse(line) as Record<string, unknown>) };
}

describe('createLogger', () => {
  it('writes one JSON line per call with level, message and time', () => {
    const { logger, lines, parsed } = collect();
    logger.info('hello', { a: 1 });
    expect(lines[0]?.endsWith('\n')).toBe(true);
    expect(parsed()[0]).toEqual({ time: '2026-07-20T00:00:00.000Z', level: 'info', msg: 'hello', a: 1 });
  });

  it('supports warn and error levels', () => {
    const { logger, parsed } = collect();
    logger.warn('careful');
    logger.error('broken');
    expect(parsed().map(entry => entry.level)).toEqual(['warn', 'error']);
  });

  it('works without fields', () => {
    const { logger, parsed } = collect();
    logger.info('bare');
    expect(parsed()[0]).toEqual({ time: '2026-07-20T00:00:00.000Z', level: 'info', msg: 'bare' });
  });

  it('drops secret-like fields', () => {
    const { logger, parsed } = collect();
    logger.info('call', { tool: 'x', token: 'rsapp_pat_secret', nested: { password: 'p', keep: 1 } });
    const entry = parsed()[0]!;
    expect(entry).not.toHaveProperty('token');
    expect(entry.nested).toEqual({ keep: 1 });
    expect(entry.tool).toBe('x');
  });

  it('defaults the timestamp to the current time', () => {
    const lines: string[] = [];
    const logger = createLogger({ write: line => lines.push(line) });
    logger.info('now');
    const entry = JSON.parse(lines[0]!) as { time: string };
    expect(Number.isNaN(Date.parse(entry.time))).toBe(false);
  });
});

describe('noopLogger', () => {
  it('accepts calls and writes nothing', () => {
    const write = vi.spyOn(process.stdout, 'write');
    noopLogger.info('a');
    noopLogger.warn('b');
    noopLogger.error('c');
    expect(write).not.toHaveBeenCalled();
    write.mockRestore();
  });
});

describe('stream loggers', () => {
  it('createStdoutLogger writes to stdout (HTTP mode)', () => {
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    createStdoutLogger().info('http line', { port: 8080 });
    expect(write).toHaveBeenCalledTimes(1);
    expect(String(write.mock.calls[0]?.[0])).toContain('"msg":"http line"');
    write.mockRestore();
  });

  it('createStderrLogger writes to stderr, never stdout (stdio mode)', () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    createStderrLogger().error('stdio line');
    expect(stderr).toHaveBeenCalledTimes(1);
    // stdout carries the JSON-RPC stream — a log line there corrupts the protocol.
    expect(stdout).not.toHaveBeenCalled();
    stderr.mockRestore();
    stdout.mockRestore();
  });
});
