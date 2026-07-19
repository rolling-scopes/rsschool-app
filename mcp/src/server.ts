#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { RsappApiClient } from './api-client.js';
import { readStdioConfig } from './config.js';
import { createMcpServer } from './create-server.js';
import { resolveUser } from './roles.js';

async function main() {
  const config = readStdioConfig();
  const client = new RsappApiClient(config);

  // Resolve the PAT owner's roles once at startup: the advertised tool list
  // is fixed for the lifetime of a stdio session. A revoked PAT fails fast
  // here with a human-readable hint.
  const user = await resolveUser(client);

  const server = createMcpServer({ client, user, toolsets: config.toolsets });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
