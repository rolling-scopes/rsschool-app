import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const deleteCourseEventInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseEventId: z.number().int().positive().describe('Numeric ID of the course event to delete'),
});

export type DeleteCourseEventInput = z.infer<typeof deleteCourseEventInputSchema>;

export const DELETE_COURSE_EVENT_TOOL = {
  name: 'delete_course_event',
  description:
    'Remove an event from a course. DESTRUCTIVE — always name the exact event (see list_course_events) and get explicit user confirmation before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseEventId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course event' },
    },
    required: ['courseId', 'courseEventId'],
    additionalProperties: false,
  },
} as const;

export async function runDeleteCourseEvent(ctx: ToolContext, input: DeleteCourseEventInput): Promise<string> {
  const result = await ctx.client.delete<unknown>(`/courses/${input.courseId}/events/${input.courseEventId}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Course event ${input.courseEventId} deleted from course ${input.courseId}.`;
}
