import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const listEventCatalogInputSchema = z.object({
  search: z.string().min(1).max(100).optional().describe('Case-insensitive substring of the event name'),
  limit: z.number().int().positive().max(200).optional().describe('Max events to return (default 50)'),
});

export type ListEventCatalogInput = z.infer<typeof listEventCatalogInputSchema>;

export const LIST_EVENT_CATALOG_TOOL = {
  name: 'list_event_catalog',
  description:
    'List events from the global event catalog with their IDs. Use this to find the eventId required by create_course_event — course events are created from catalog entries. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      search: { type: 'string', minLength: 1, maxLength: 100, description: 'Substring of the event name' },
      limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Max events to return (default 50)' },
    },
    additionalProperties: false,
  },
} as const;

type CatalogEvent = {
  id: number;
  name?: string | null;
  type?: string | null;
  descriptionUrl?: string | null;
};

const DEFAULT_LIMIT = 50;

export async function runListEventCatalog(ctx: ToolContext, input: ListEventCatalogInput): Promise<ToolResult> {
  const result = await ctx.client.get<CatalogEvent[]>('/events');
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  const needle = input.search?.toLowerCase();
  const matched = needle ? result.data.filter(event => (event.name ?? '').toLowerCase().includes(needle)) : result.data;
  if (matched.length === 0) {
    return needle ? `No catalog events match "${input.search}".` : 'The event catalog is empty.';
  }
  const limit = input.limit ?? DEFAULT_LIMIT;
  const shown = matched.slice(0, limit);
  const rows = shown.map(event =>
    [`- id=${event.id}`, `name=${event.name ?? '?'}`, event.type ? `type=${event.type}` : null]
      .filter(Boolean)
      .join(' | '),
  );
  const suffix =
    matched.length > shown.length ? `\n…and ${matched.length - shown.length} more (narrow with "search")` : '';
  return [`${matched.length} catalog event(s), showing ${shown.length}:`, ...rows].join('\n') + suffix;
}
