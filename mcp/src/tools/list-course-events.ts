import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const listCourseEventsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type ListCourseEventsInput = z.infer<typeof listCourseEventsInputSchema>;

export const LIST_COURSE_EVENTS_TOOL = {
  name: 'list_course_events',
  description:
    'List events of a course (lectures, meetups, deadlines-adjacent events) with ids, dates and places. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runListCourseEvents(ctx: ToolContext, input: ListCourseEventsInput): Promise<string> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/events`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return `Course ${input.courseId} has no events.`;
  }
  return toJsonBlock(result.data);
}
