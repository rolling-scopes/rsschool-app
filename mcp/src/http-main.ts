#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { DEFAULT_API_PREFIX } from './api-client.js';
import { createMcpHttpHandler, sendJsonRpcError } from './http.js';
import { parseToolsets } from './roles.js';

const MAX_BODY_BYTES = 4 * 1024 * 1024;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
} as const;

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
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

function applyCors(res: ServerResponse): void {
  for (const [header, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(header, value);
  }
}

function main() {
  const baseUrl = process.env.RSAPP_BASE_URL;
  if (!baseUrl) {
    throw new Error('RSAPP_BASE_URL env variable is required');
  }
  const handler = createMcpHttpHandler({
    baseUrl,
    apiPrefix: process.env.RSAPP_API_PREFIX ?? DEFAULT_API_PREFIX,
    toolsets: parseToolsets(process.env.RSAPP_TOOLSETS),
  });
  const port = Number(process.env.NODE_PORT) || 8080;

  const server = createServer(async (req, res) => {
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

    applyCors(res);

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
  });

  server.listen(port, () => {
    console.log(`RS School MCP server (streamable HTTP) listening on :${port}`);
  });
}

main();
