import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const listMentorRegistryInputSchema = z.object({
  status: z.enum(['all', 'new', 'active', 'inactive']).optional().describe('Registry tab (default all)'),
  page: z.number().int().positive().optional().describe('Page number (default 1)'),
  pageSize: z.number().int().positive().max(100).optional().describe('Page size (default 20)'),
  githubId: z.string().optional().describe('Filter by GitHub login'),
});

export type ListMentorRegistryInput = z.infer<typeof listMentorRegistryInputSchema>;

export const LIST_MENTOR_REGISTRY_TOOL = {
  name: 'list_mentor_registry',
  description:
    'List mentor registration applications: who applied to mentor, preferred courses and status. For managers/supervisors approving mentors. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['all', 'new', 'active', 'inactive'], description: 'Registry tab (default all)' },
      page: { type: 'integer', minimum: 1, description: 'Page number (default 1)' },
      pageSize: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size (default 20)' },
      githubId: { type: 'string', description: 'Filter by GitHub login' },
    },
    additionalProperties: false,
  },
} as const;

export async function runListMentorRegistry(ctx: ToolContext, input: ListMentorRegistryInput): Promise<string> {
  const params = new URLSearchParams({
    status: input.status ?? 'all',
    currentPage: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });
  if (input.githubId) {
    params.set('githubId', input.githubId);
  }
  const result = await ctx.client.get<unknown>(`/registry/mentors?${params.toString()}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
