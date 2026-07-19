import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createMcpHttpHandler, sendJsonRpcError } from './http.js';

const STUDENT_PAT = 'rsapp_pat_student1_secret';
const MANAGER_PAT = 'rsapp_pat_manager1_secret';

let backend: HttpServer;
let mcp: HttpServer;
let mcpUrl: string;

beforeAll(async () => {
  backend = createServer((req, res) => {
    const auth = req.headers.authorization ?? '';
    const token = auth.replace('Bearer ', '');
    if (req.url === '/session') {
      if (token === STUDENT_PAT) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            id: 1,
            githubId: 'student',
            isAdmin: false,
            courses: { 5: { roles: ['student'], studentId: 42 } },
          }),
        );
        return;
      }
      if (token === MANAGER_PAT) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 2, githubId: 'manager', isAdmin: false, courses: { 5: { roles: ['manager'] } } }));
        return;
      }
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise<void>(resolve => backend.listen(0, resolve));

  const handler = createMcpHttpHandler({
    baseUrl: `http://127.0.0.1:${(backend.address() as AddressInfo).port}`,
    apiPrefix: '',
    userCacheTtlMs: 0,
  });
  mcp = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      sendJsonRpcError(res, 400, -32700, 'Invalid JSON');
      return;
    }
    await handler(req, res, body);
  });
  await new Promise<void>(resolve => mcp.listen(0, resolve));
  mcpUrl = `http://127.0.0.1:${(mcp.address() as AddressInfo).port}/mcp`;
});

afterAll(async () => {
  await new Promise(resolve => mcp.close(resolve));
  await new Promise(resolve => backend.close(resolve));
});

async function connectClient(pat: string): Promise<Client> {
  const client = new Client({ name: 'spec-client', version: '0.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: { headers: { Authorization: `Bearer ${pat}` } },
  });
  await client.connect(transport);
  return client;
}

describe('streamable HTTP entrypoint', () => {
  it('filters the tool list per PAT roles', async () => {
    const studentClient = await connectClient(STUDENT_PAT);
    const studentTools = (await studentClient.listTools()).tools.map(t => t.name);
    expect(studentTools).toContain('get_my_score');
    expect(studentTools).toContain('list_my_courses');
    expect(studentTools).not.toContain('issue_certificate');
    await studentClient.close();

    const managerClient = await connectClient(MANAGER_PAT);
    const managerTools = (await managerClient.listTools()).tools.map(t => t.name);
    expect(managerTools).toContain('issue_certificate');
    expect(managerTools).not.toContain('get_my_score');
    await managerClient.close();
  });

  it('rejects requests without a PAT', async () => {
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
    });
    expect(response.status).toBe(401);
    const payload = (await response.json()) as { error: { message: string } };
    expect(payload.error.message).toContain('Authorization');
  });

  it('rejects requests with an invalid PAT', async () => {
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: 'Bearer rsapp_pat_bogus_token',
      },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
    });
    expect(response.status).toBe(401);
  });
});
