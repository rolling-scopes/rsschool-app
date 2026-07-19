import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendJsonRpcError } from './http.js';

export const MAX_BODY_BYTES = 4 * 1024 * 1024;

export type ListenerOptions = {
  /**
   * Origin allow-list for CORS. When non-empty, the request `Origin` is
   * reflected only if it is on the list (otherwise no `Access-Control-Allow-Origin`
   * header is sent, so browsers block the cross-origin read). When empty/undefined
   * the endpoint stays open with `*` — acceptable only because auth is a
   * non-cookie Bearer PAT that a browser cannot attach automatically.
   */
  allowedOrigins?: string[];
};

const CORS_STATIC_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
} as const;

/** Parse a comma-separated env var into a trimmed, non-empty list (or undefined). */
export function parseCsvList(raw: string | undefined): string[] | undefined {
  if (!raw) {
    return undefined;
  }
  const items = raw
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
  return items.length > 0 ? items : undefined;
}

export function readBody(req: IncomingMessage, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Resolve the `Access-Control-Allow-Origin` value for a request. With no
 * allow-list configured we fall back to `*`; with one, we reflect the request
 * origin only when it is allowed (and `undefined` otherwise, which omits the
 * header so the browser blocks the read).
 */
export function resolveAllowOrigin(requestOrigin: string | undefined, allowedOrigins?: string[]): string | undefined {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return '*';
  }
  return requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : undefined;
}

export function applyCors(req: IncomingMessage, res: ServerResponse, allowedOrigins?: string[]): void {
  const allowOrigin = resolveAllowOrigin(req.headers.origin, allowedOrigins);
  if (allowOrigin !== undefined) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    if (allowOrigin !== '*') {
      res.setHeader('Vary', 'Origin');
    }
  }
  for (const [header, value] of Object.entries(CORS_STATIC_HEADERS)) {
    res.setHeader(header, value);
  }
}

export type McpRequestHandler = (req: IncomingMessage, res: ServerResponse, body: unknown) => Promise<void>;

/**
 * Request listener shared by the production bootstrap (http-main.ts) and
 * tests: /health, CORS preflight, stateless-mode 405 for GET/DELETE, JSON
 * body limits, and delegation to the MCP handler for POST /mcp.
 */
export function createRequestListener(handler: McpRequestHandler, options: ListenerOptions = {}) {
  return async function listener(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not found' }));
      return;
    }

    applyCors(req, res, options.allowedOrigins);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      // Stateless mode: no SSE stream to GET, no session to DELETE.
      res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS' });
      res.end(JSON.stringify({ message: 'Method not allowed. This MCP endpoint is stateless: use POST.' }));
      return;
    }

    try {
      const body = await readBody(req);
      await handler(req, res, body);
    } catch (err) {
      if (!res.headersSent) {
        sendJsonRpcError(res, 400, -32700, err instanceof Error ? err.message : 'Bad request');
      } else {
        res.end();
      }
    }
  };
}
