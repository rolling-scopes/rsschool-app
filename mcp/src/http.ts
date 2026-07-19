import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RsappApiClient } from './api-client.js';
import { createMcpServer } from './create-server.js';
import { resolveUser } from './roles.js';
import type { ResolvedUser, Toolset } from './types.js';

export type McpHttpConfig = {
  baseUrl: string;
  apiPrefix: string;
  toolsets?: Toolset[];
  /** TTL of the per-token role cache, ms. 0 disables caching. */
  userCacheTtlMs?: number;
};

const DEFAULT_USER_CACHE_TTL_MS = 60_000;
const USER_CACHE_MAX_ENTRIES = 500;

type CacheEntry = { user: ResolvedUser; expiresAt: number };

/**
 * Stateless streamable-HTTP handler: every POST carries the PAT in the
 * Authorization header, gets its own MCP server instance with a tool list
 * filtered to that user's roles, and receives a plain JSON response (no SSE).
 *
 * Role resolution is cached briefly per token hash — a revoked PAT still
 * fails on the actual API call, so the cache only bounds tool-list staleness.
 */
export function createMcpHttpHandler(config: McpHttpConfig) {
  const cache = new Map<string, CacheEntry>();
  const ttl = config.userCacheTtlMs ?? DEFAULT_USER_CACHE_TTL_MS;

  async function getUser(client: RsappApiClient, token: string): Promise<ResolvedUser> {
    if (ttl <= 0) {
      return resolveUser(client);
    }
    const key = createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.user;
    }
    const user = await resolveUser(client);
    if (cache.size >= USER_CACHE_MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) {
        cache.delete(oldest);
      }
    }
    cache.set(key, { user, expiresAt: now + ttl });
    return user;
  }

  return async function handleMcpHttpRequest(req: IncomingMessage, res: ServerResponse, body: unknown): Promise<void> {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : undefined;
    if (!token || !token.startsWith('rsapp_pat_')) {
      sendJsonRpcError(res, 401, -32001, 'Missing or malformed Authorization header. Expected: Bearer rsapp_pat_…');
      return;
    }

    const client = new RsappApiClient({ baseUrl: config.baseUrl, token, apiPrefix: config.apiPrefix });

    let user: ResolvedUser;
    try {
      user = await getUser(client, token);
    } catch (err) {
      sendJsonRpcError(res, 401, -32001, err instanceof Error ? err.message : 'Authentication failed');
      return;
    }

    const server = createMcpServer({ client, user, toolsets: config.toolsets });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  };
}

export function sendJsonRpcError(res: ServerResponse, httpStatus: number, code: number, message: string): void {
  res.writeHead(httpStatus, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));
}
