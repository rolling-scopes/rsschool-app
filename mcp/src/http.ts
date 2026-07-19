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
  /**
   * Host allow-list for DNS-rebinding protection (matched against the `Host`
   * header). When either this or `allowedOrigins` is non-empty, the transport
   * enables DNS-rebinding protection. Empty/undefined = protection off (local
   * dev / trusted network).
   */
  allowedHosts?: string[];
  /** Origin allow-list for the transport's Origin check (browser clients). */
  allowedOrigins?: string[];
};

const DEFAULT_USER_CACHE_TTL_MS = 60_000;
const USER_CACHE_MAX_ENTRIES = 500;

/** DNS-rebinding protection turns on once any host/origin allow-list is set. */
export function dnsRebindingEnabled(allowedHosts?: string[], allowedOrigins?: string[]): boolean {
  return Boolean(allowedHosts?.length || allowedOrigins?.length);
}

type CacheEntry = { user: ResolvedUser; expiresAt: number };

/**
 * Per-token role cache keyed by sha256(token). A revoked PAT still fails on
 * the actual API call, so the cache only bounds tool-list staleness.
 */
export class UserRoleCache {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = USER_CACHE_MAX_ENTRIES,
  ) {}

  async getUser(token: string, resolve: () => Promise<ResolvedUser>): Promise<ResolvedUser> {
    if (this.ttlMs <= 0) {
      return resolve();
    }
    const key = createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.user;
    }
    const user = await resolve();
    if (this.cache.size >= this.maxEntries) {
      // size >= maxEntries (> 0) guarantees at least one key exists.
      this.cache.delete(this.cache.keys().next().value as string);
    }
    this.cache.set(key, { user, expiresAt: now + this.ttlMs });
    return user;
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Stateless streamable-HTTP handler: every POST carries the PAT in the
 * Authorization header, gets its own MCP server instance with a tool list
 * filtered to that user's roles, and receives a plain JSON response (no SSE).
 */
export function createMcpHttpHandler(config: McpHttpConfig) {
  const cache = new UserRoleCache(config.userCacheTtlMs ?? DEFAULT_USER_CACHE_TTL_MS);

  const getUser = (client: RsappApiClient, token: string) => cache.getUser(token, () => resolveUser(client));

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
      sendJsonRpcError(res, 401, -32001, errorMessage(err));
      return;
    }

    const server = createMcpServer({ client, user, toolsets: config.toolsets });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      // Protect against DNS-rebinding: reject requests whose Host/Origin is not
      // in the allow-list. Only active once at least one list is configured, so
      // local/trusted-network deployments are unaffected.
      enableDnsRebindingProtection: dnsRebindingEnabled(config.allowedHosts, config.allowedOrigins),
      allowedHosts: config.allowedHosts,
      allowedOrigins: config.allowedOrigins,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  };
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Authentication failed';
}

export function sendJsonRpcError(res: ServerResponse, httpStatus: number, code: number, message: string): void {
  res.writeHead(httpStatus, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }));
}
