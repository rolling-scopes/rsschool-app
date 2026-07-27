#!/usr/bin/env node
import { readTimeoutMs } from './config.js';
import { createMcpHttpHandler } from './http.js';
import { createRequestListener, parseCsvList } from './http-server.js';
import { createHttpServer, installShutdownHandlers } from './lifecycle.js';
import { createStdoutLogger } from './logger.js';
import { parseToolsets } from './roles.js';

function main() {
  const logger = createStdoutLogger();
  const baseUrl = process.env.RSAPP_BASE_URL;
  if (!baseUrl) {
    throw new Error('RSAPP_BASE_URL env variable is required');
  }
  const allowedHosts = parseCsvList(process.env.RSAPP_ALLOWED_HOSTS);
  const allowedOrigins = parseCsvList(process.env.RSAPP_ALLOWED_ORIGINS);
  const handler = createMcpHttpHandler({
    baseUrl,
    toolsets: parseToolsets(process.env.RSAPP_TOOLSETS),
    allowedHosts,
    allowedOrigins,
    timeoutMs: readTimeoutMs(process.env.RSAPP_REQUEST_TIMEOUT_MS),
    logger,
  });
  const port = Number(process.env.NODE_PORT) || 8080;

  const server = createHttpServer(createRequestListener(handler, { allowedOrigins }));
  installShutdownHandlers({ server, logger });
  server.listen(port, () => {
    logger.info('mcp server listening', {
      port,
      dnsRebindingProtection: Boolean(allowedHosts?.length || allowedOrigins?.length),
      toolsets: process.env.RSAPP_TOOLSETS || 'all',
    });
  });
}

main();
