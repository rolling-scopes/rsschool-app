import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { redactSecrets } from '../redact.js';
import type { ToolContext } from '../types.js';

export const listCourseMentorsDetailsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  limit: z.number().int().positive().max(200).optional().describe('Max mentors to return (default 50)'),
});

export type ListCourseMentorsDetailsInput = z.infer<typeof listCourseMentorsDetailsInputSchema>;

export const LIST_COURSE_MENTORS_DETAILS_TOOL = {
  name: 'list_course_mentors_details',
  description:
    'List mentors of a course with details: assigned students count, checked tasks and activity. Requires supervisor / manager role in the course, or admin. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Max mentors to return (default 50)' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

const DEFAULT_LIMIT = 50;

export async function runListCourseMentorsDetails(
  ctx: ToolContext,
  input: ListCourseMentorsDetailsInput,
): Promise<string> {
  const result = await ctx.client.get<unknown[]>(`/course/${input.courseId}/mentors/details`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const total = result.data.length;
  if (total === 0) {
    return `Course ${input.courseId} has no mentors.`;
  }
  const limit = input.limit ?? DEFAULT_LIMIT;
  const shown = redactSecrets(result.data.slice(0, limit));
  const suffix = total > shown.length ? `\n…and ${total - shown.length} more (raise "limit" to see them)` : '';
  return [`${total} mentor(s), showing ${shown.length}:`, toJsonBlock(shown)].join('\n') + suffix;
}
