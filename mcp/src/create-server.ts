import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { RsappApiClient } from './api-client.js';
import { filterTools } from './roles.js';
import { TOOLS } from './registry.js';
import type { ResolvedUser, ToolBinding, Toolset } from './types.js';

export type ServerContext = {
  client: RsappApiClient;
  user: ResolvedUser;
  toolsets?: Toolset[];
  registry?: ToolBinding[];
};

export const SERVER_INFO = { name: 'rsschool', version: '0.2.0' };

/**
 * Builds an MCP server whose tool list is filtered to the resolved user's
 * roles (and, optionally, an explicit toolset selection). Used by both the
 * stdio entrypoint (one server per process) and the streamable HTTP
 * entrypoint (one server per request — filtering is per instance by design).
 */
export function createMcpServer(ctx: ServerContext): Server {
  const available = filterTools(ctx.registry ?? TOOLS, ctx.user, ctx.toolsets);
  const server = new Server(SERVER_INFO, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: available.map(binding => binding.tool),
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const binding = available.find(b => b.tool.name === request.params.name);
    if (!binding) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Unknown tool or not available for your role: ${request.params.name}`,
          },
        ],
      };
    }
    const parsed = binding.schema.safeParse(request.params.arguments);
    if (!parsed.success) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
      };
    }
    const text = await binding.run({ client: ctx.client, user: ctx.user }, parsed.data as never);
    return { content: [{ type: 'text', text }] };
  });

  return server;
}
