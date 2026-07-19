import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';
import { courseEventFieldsJsonSchemaProperties, courseEventFieldsSchema } from './course-event-fields.js';

export const updateCourseEventInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseEventId: z.number().int().positive().describe('Numeric ID of the course event to update'),
  ...courseEventFieldsSchema,
});

export type UpdateCourseEventInput = z.infer<typeof updateCourseEventInputSchema>;

export const UPDATE_COURSE_EVENT_TOOL = {
  name: 'update_course_event',
  description:
    'Update a course event: date, place, organizer. Only the provided fields are changed. Confirm the changes with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseEventId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course event' },
      ...courseEventFieldsJsonSchemaProperties,
    },
    required: ['courseId', 'courseEventId'],
    additionalProperties: false,
  },
} as const;

export async function runUpdateCourseEvent(ctx: ToolContext, input: UpdateCourseEventInput): Promise<string> {
  const { courseId, courseEventId, ...fields } = input;
  const body = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  if (Object.keys(body).length === 0) {
    return 'Nothing to update: provide at least one field.';
  }
  const result = await ctx.client.put<unknown>(`/courses/${courseId}/events/${courseEventId}`, body);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Course event ${courseEventId} updated (${Object.keys(body).join(', ')}).`;
}
