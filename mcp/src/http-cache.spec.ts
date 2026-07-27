import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { closeQuietly, createMcpHttpHandler, errorMessage, UserRoleCache } from './http.js';
import type { ResolvedUser } from './types.js';
import { createRequestListener } from './http-server.js';

/**
 * Focused tests for the per-token role cache inside createMcpHttpHandler:
 * TTL hit/miss, ttl=0 bypass, and eviction of the oldest entry at capacity.
 */
let backend: HttpServer;
let backendUrl: string;
let sessionHits = 0;

beforeAll(async () => {
  backend = createServer((req, res) => {
    if (req.url === '/session') {
      sessionHits += 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 1, githubId: 'octo', isAdmin: false, courses: {} }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise<void>(resolve => backend.listen(0, resolve));
  backendUrl = `http://127.0.0.1:${(backend.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise(resolve => backend.close(resolve));
});

afterEach(() => {
  sessionHits = 0;
  vi.useRealTimers();
});

async function callListTools(mcpUrl: string, pat: string): Promise<number> {
  const response = await fetch(`${mcpUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${pat}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
  });
  return response.status;
}

async function withMcpServer(
  options: { userCacheTtlMs?: number },
  run: (mcpUrl: string) => Promise<void>,
): Promise<void> {
  const handler = createMcpHttpHandler({ baseUrl: backendUrl, ...options });
  const server = createServer((req, res) => void createRequestListener(handler)(req, res));
  await new Promise<void>(resolve => server.listen(0, resolve));
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

describe('createMcpHttpHandler role cache', () => {
  it('reuses the cached user within the TTL', async () => {
    await withMcpServer({ userCacheTtlMs: 60_000 }, async mcpUrl => {
      await callListTools(mcpUrl, 'rsapp_pat_cached_token');
      await callListTools(mcpUrl, 'rsapp_pat_cached_token');
      expect(sessionHits).toBe(1);
    });
  });

  it('bypasses the cache when ttl is 0', async () => {
    await withMcpServer({ userCacheTtlMs: 0 }, async mcpUrl => {
      await callListTools(mcpUrl, 'rsapp_pat_nocache_token');
      await callListTools(mcpUrl, 'rsapp_pat_nocache_token');
      expect(sessionHits).toBe(2);
    });
  });

  it('resolves different tokens independently', async () => {
    await withMcpServer({ userCacheTtlMs: 60_000 }, async mcpUrl => {
      await callListTools(mcpUrl, 'rsapp_pat_token_one');
      await callListTools(mcpUrl, 'rsapp_pat_token_two');
      expect(sessionHits).toBe(2);
    });
  });

  it('re-resolves after the TTL expires', async () => {
    await withMcpServer({ userCacheTtlMs: 1 }, async mcpUrl => {
      await callListTools(mcpUrl, 'rsapp_pat_expiring_token');
      await new Promise(resolve => setTimeout(resolve, 10));
      await callListTools(mcpUrl, 'rsapp_pat_expiring_token');
      expect(sessionHits).toBe(2);
    });
  });
});

describe('errorMessage', () => {
  it('extracts Error messages and falls back for non-Errors', () => {
    expect(errorMessage(new Error('nope'))).toBe('nope');
    expect(errorMessage('weird')).toBe('Authentication failed');
  });
});

describe('rejects non-Bearer Authorization headers', () => {
  it('returns 401 for Basic auth', async () => {
    await withMcpServer({}, async mcpUrl => {
      const response = await fetch(`${mcpUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          Authorization: 'Basic dXNlcjpwYXNz',
        },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
      });
      expect(response.status).toBe(401);
    });
  });
});

describe('UserRoleCache', () => {
  const user = (id: number): ResolvedUser => ({
    id,
    githubId: `u${id}`,
    isAdmin: false,
    roles: new Set(),
    courses: [],
  });

  it('evicts the oldest entry at capacity', async () => {
    const cache = new UserRoleCache(60_000, 2);
    let resolves = 0;
    const resolve = (id: number) => async () => {
      resolves += 1;
      return user(id);
    };
    await cache.getUser('token-a', resolve(1));
    await cache.getUser('token-b', resolve(2));
    await cache.getUser('token-c', resolve(3)); // evicts token-a
    expect(cache.size).toBe(2);
    await cache.getUser('token-a', resolve(1)); // must re-resolve
    expect(resolves).toBe(4);
  });

  it('serves a fresh entry without re-resolving', async () => {
    const cache = new UserRoleCache(60_000);
    let resolves = 0;
    const resolve = async () => {
      resolves += 1;
      return user(1);
    };
    await cache.getUser('token', resolve);
    const cached = await cache.getUser('token', resolve);
    expect(cached.id).toBe(1);
    expect(resolves).toBe(1);
  });
});

describe('UserRoleCache eviction order', () => {
  const user = (id: number): ResolvedUser => ({
    id,
    githubId: `u${id}`,
    isAdmin: false,
    roles: new Set(),
    courses: [],
  });

  it('drops expired entries before fresh ones when at capacity', async () => {
    // ttl 1ms: the first two entries expire, the third must survive eviction.
    const cache = new UserRoleCache(1, 2);
    await cache.getUser('stale-a', async () => user(1));
    await cache.getUser('stale-b', async () => user(2));
    await new Promise(resolve => setTimeout(resolve, 5));

    await cache.getUser('fresh', async () => user(3));
    // Both stale entries were reaped, so the newcomer is the only survivor —
    // plain FIFO would have dropped exactly one and left the cache full.
    expect(cache.size).toBe(1);
  });

  it('falls back to dropping the oldest when nothing is expired', async () => {
    const cache = new UserRoleCache(60_000, 2);
    let resolved = 0;
    const make = (id: number) => async () => {
      resolved += 1;
      return user(id);
    };
    await cache.getUser('a', make(1));
    await cache.getUser('b', make(2));
    await cache.getUser('c', make(3));
    expect(cache.size).toBe(2);
    await cache.getUser('a', make(1)); // evicted earlier, must re-resolve
    expect(resolved).toBe(4);
  });
});

describe('closeQuietly', () => {
  it('swallows a teardown failure and logs it', async () => {
    const warnings: Array<Record<string, unknown> | undefined> = [];
    const logger = {
      info: () => undefined,
      warn: (_message: string, fields?: Record<string, unknown>) => void warnings.push(fields),
      error: () => undefined,
    };
    await closeQuietly(
      async () => {
        throw new Error('socket already gone');
      },
      logger,
      'req-9',
    );
    expect(warnings[0]).toMatchObject({ requestId: 'req-9', error: 'socket already gone' });
  });

  it('stringifies a non-Error rejection', async () => {
    const warnings: Array<Record<string, unknown> | undefined> = [];
    const logger = {
      info: () => undefined,
      warn: (_message: string, fields?: Record<string, unknown>) => void warnings.push(fields),
      error: () => undefined,
    };
    await closeQuietly(async () => Promise.reject('plain'), logger, 'req-10');
    expect(warnings[0]).toMatchObject({ error: 'plain' });
  });

  it('does nothing when close succeeds', async () => {
    const warn = vi.fn();
    await closeQuietly(async () => undefined, { info: vi.fn(), warn, error: vi.fn() }, 'req-11');
    expect(warn).not.toHaveBeenCalled();
  });
});
