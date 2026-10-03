import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { RsappApiClient } from './api-client.js';
import { filterTools, hasCourseRole } from './roles.js';
import { noopLogger, type Logger } from './logger.js';
import { TOOLS } from './registry.js';
import { isToolFailure, type ResolvedUser, type ToolBinding, type Toolset } from './types.js';
import { SERVER_VERSION } from './version.js';

/**
 * A course-scoped tool takes a `courseId` and acts within that one course. We
 * read it off the validated input by convention so the per-course authz check
 * lives in one place instead of every handler. Tools keyed by another id
 * (interviewId, courseTaskId, …) can't be mapped to a course here and rely on
 * the backend guard.
 */
export function courseIdFromInput(input: unknown): number | undefined {
  if (input && typeof input === 'object' && 'courseId' in input) {
    const value = (input as { courseId: unknown }).courseId;
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }
  }
  return undefined;
}

export type ServerContext = {
  client: RsappApiClient;
  user: ResolvedUser;
  toolsets?: Toolset[];
  registry?: ToolBinding[];
  logger?: Logger;
  /** Correlates every log line of one HTTP request. */
  requestId?: string;
};

export const SERVER_INFO = { name: 'rsschool', version: SERVER_VERSION };

/**
 * Builds an MCP server whose tool list is filtered to the resolved user's
 * roles (and, optionally, an explicit toolset selection). Used by both the
 * stdio entrypoint (one server per process) and the streamable HTTP
 * entrypoint (one server per request — filtering is per instance by design).
 */
export function createMcpServer(ctx: ServerContext): Server {
  const available = filterTools(ctx.registry ?? TOOLS, ctx.user, ctx.toolsets);
  const logger = ctx.logger ?? noopLogger;
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
    // Defense-in-depth: a role-gated tool acting on a specific course must have
    // that role in *that* course, not merely in some course (the union gate).
    const courseId = courseIdFromInput(parsed.data);
    if (binding.roles.length > 0 && courseId !== undefined && !hasCourseRole(ctx.user, courseId, binding.roles)) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Not authorized: this action requires one of [${binding.roles.join(', ')}] in course ${courseId}.`,
          },
        ],
      };
    }
    const base = { requestId: ctx.requestId, tool: binding.tool.name, githubId: ctx.user.githubId };
    const startedAt = Date.now();
    try {
      // Tag the outgoing API calls with the tool name so the backend audit log
      // can attribute them (X-MCP-Tool).
      const client = ctx.client.withTool(binding.tool.name);
      const result = await binding.run({ client, user: ctx.user }, parsed.data as never);
      const failed = isToolFailure(result);
      logger.info('tool call', { ...base, durationMs: Date.now() - startedAt, outcome: failed ? 'tool_error' : 'ok' });
      return failed
        ? { isError: true, content: [{ type: 'text', text: result.text }] }
        : { content: [{ type: 'text', text: result }] };
    } catch (err) {
      // Details stay in the log; the model gets a neutral message so internal
      // stack/detail never reaches the client.
      logger.error('tool exception', {
        ...base,
        durationMs: Date.now() - startedAt,
        outcome: 'exception',
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        isError: true,
        content: [{ type: 'text', text: `The tool "${binding.tool.name}" failed unexpectedly. Please try again.` }],
      };
    }
  });

  return server;
}
