import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const listTaskCatalogInputSchema = z.object({
  search: z.string().min(1).max(100).optional().describe('Case-insensitive substring of the task name'),
  limit: z.number().int().positive().max(200).optional().describe('Max tasks to return (default 50)'),
});

export type ListTaskCatalogInput = z.infer<typeof listTaskCatalogInputSchema>;

export const LIST_TASK_CATALOG_TOOL = {
  name: 'list_task_catalog',
  description:
    'List tasks from the global task catalog with their IDs. Use this to find the taskId required by create_course_task — course tasks are created from catalog entries, not from scratch. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      search: { type: 'string', minLength: 1, maxLength: 100, description: 'Substring of the task name' },
      limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Max tasks to return (default 50)' },
    },
    additionalProperties: false,
  },
} as const;

type CatalogTask = {
  id: number;
  name?: string | null;
  type?: string | null;
  descriptionUrl?: string | null;
  disciplineId?: number | null;
};

const DEFAULT_LIMIT = 50;

export async function runListTaskCatalog(ctx: ToolContext, input: ListTaskCatalogInput): Promise<ToolResult> {
  const result = await ctx.client.get<CatalogTask[]>('/tasks');
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  const needle = input.search?.toLowerCase();
  const matched = needle ? result.data.filter(task => (task.name ?? '').toLowerCase().includes(needle)) : result.data;
  if (matched.length === 0) {
    return needle ? `No catalog tasks match "${input.search}".` : 'The task catalog is empty.';
  }
  const limit = input.limit ?? DEFAULT_LIMIT;
  const shown = matched.slice(0, limit);
  const rows = shown.map(task =>
    [`- id=${task.id}`, `name=${task.name ?? '?'}`, task.type ? `type=${task.type}` : null].filter(Boolean).join(' | '),
  );
  const suffix =
    matched.length > shown.length ? `\n…and ${matched.length - shown.length} more (narrow with "search")` : '';
  return [`${matched.length} catalog task(s), showing ${shown.length}:`, ...rows].join('\n') + suffix;
}
