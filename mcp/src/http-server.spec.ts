import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createRequestListener, type McpRequestHandler } from './http-server.js';

let server: HttpServer;
let baseUrl: string;
const handler = vi.fn<McpRequestHandler>(async (_req, res, body) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ echoed: body ?? null }));
});

beforeAll(async () => {
  server = createServer((req, res) => void createRequestListener(handler)(req, res));
  await new Promise<void>(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

describe('createRequestListener', () => {
  it('serves /health', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown paths', async () => {
    const response = await fetch(`${baseUrl}/nope`);
    expect(response.status).toBe(404);
  });

  it('answers OPTIONS preflight with CORS headers', async () => {
    const response = await fetch(`${baseUrl}/mcp`, { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('access-control-allow-headers')).toContain('Authorization');
  });

  it('rejects GET and DELETE with 405 (stateless mode)', async () => {
    const get = await fetch(`${baseUrl}/mcp`);
    expect(get.status).toBe(405);
    expect(get.headers.get('allow')).toBe('POST, OPTIONS');
    const del = await fetch(`${baseUrl}/mcp`, { method: 'DELETE' });
    expect(del.status).toBe(405);
  });

  it('parses the JSON body and delegates POST to the handler', async () => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ echoed: { hello: 'world' } });
  });

  it('treats an empty body as undefined', async () => {
    const response = await fetch(`${baseUrl}/mcp`, { method: 'POST' });
    expect(await response.json()).toEqual({ echoed: null });
  });

  it('returns a JSON-RPC parse error for invalid JSON', async () => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { error: { code: number; message: string } };
    expect(payload.error.code).toBe(-32700);
    expect(payload.error.message).toContain('Invalid JSON');
  });

  it('rejects oversized bodies', async () => {
    const big = '"'.padEnd(5 * 1024 * 1024, 'x') + '"';
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: big,
    }).catch(() => null);
    // The server destroys the socket; depending on timing fetch either gets
    // the 400 response or a connection error — both prove the limit works.
    const limitEnforced = response === null || response.status === 400;
    expect(limitEnforced).toBe(true);
  });

  it('ends the response when the handler fails after headers were sent', async () => {
    handler.mockImplementationOnce(async (_req, res) => {
      res.writeHead(200);
      throw new Error('late failure');
    });
    const response = await fetch(`${baseUrl}/mcp`, { method: 'POST' });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it('treats a request without a url as not found', async () => {
    const listener = createRequestListener(handler);
    const headers: Record<string, unknown> = {};
    let status = 0;
    const fakeRes = {
      writeHead: (code: number, hdrs?: Record<string, unknown>) => {
        status = code;
        Object.assign(headers, hdrs);
      },
      end: () => undefined,
      setHeader: () => undefined,
    };
    await listener({ url: undefined, method: 'GET' } as never, fakeRes as never);
    expect(status).toBe(404);
  });

  it('maps non-Error throw values to a generic message', async () => {
    handler.mockImplementationOnce(async () => {
      throw 'boom';
    });
    const response = await fetch(`${baseUrl}/mcp`, { method: 'POST' });
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { error: { message: string } };
    expect(payload.error.message).toBe('Bad request');
  });
});
