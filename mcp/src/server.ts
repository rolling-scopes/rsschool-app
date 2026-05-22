#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { RsappApiClient } from './api-client.js';
import { ISSUE_CERTIFICATE_TOOL, issueCertificateInputSchema, runIssueCertificate } from './tools/issue-certificate.js';

function readConfig() {
  const baseUrl = process.env.RSAPP_BASE_URL;
  const token = process.env.RSAPP_PAT;
  if (!baseUrl) {
    throw new Error('RSAPP_BASE_URL env variable is required');
  }
  if (!token) {
    throw new Error('RSAPP_PAT env variable is required');
  }
  if (!token.startsWith('rsapp_pat_')) {
    throw new Error('RSAPP_PAT must start with "rsapp_pat_"');
  }
  return { baseUrl, token };
}

async function main() {
  const config = readConfig();
  const client = new RsappApiClient(config);

  const server = new Server({ name: 'rsschool', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [ISSUE_CERTIFICATE_TOOL],
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    if (request.params.name !== ISSUE_CERTIFICATE_TOOL.name) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
      };
    }
    const parsed = issueCertificateInputSchema.safeParse(request.params.arguments);
    if (!parsed.success) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
      };
    }
    const text = await runIssueCertificate(client, parsed.data);
    return { content: [{ type: 'text', text }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  // Stdio transport reserves stdout for MCP traffic; log to stderr.
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
