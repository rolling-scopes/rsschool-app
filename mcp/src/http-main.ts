#!/usr/bin/env node
import { createServer } from 'node:http';
import { DEFAULT_API_PREFIX } from './api-client.js';
import { createMcpHttpHandler } from './http.js';
import { createRequestListener } from './http-server.js';
import { parseToolsets } from './roles.js';

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

  const server = createServer(createRequestListener(handler));
  server.listen(port, () => {
    console.log(`RS School MCP server (streamable HTTP) listening on :${port}`);
  });
}

main();
