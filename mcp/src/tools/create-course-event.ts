import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';
import { courseEventFieldsJsonSchemaProperties, courseEventFieldsSchema } from './course-event-fields.js';

export const createCourseEventInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  eventId: z.number().int().positive().describe('ID of the event from the events catalog to add to the course'),
  ...courseEventFieldsSchema,
});

export type CreateCourseEventInput = z.infer<typeof createCourseEventInputSchema>;

export const CREATE_COURSE_EVENT_TOOL = {
  name: 'create_course_event',
  description:
    'Add an event from the events catalog to a course with date, place and organizer. Find the eventId with list_event_catalog first. Confirm the event and date with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      eventId: { type: 'integer', minimum: 1, description: 'ID of the event from the events catalog' },
      ...courseEventFieldsJsonSchemaProperties,
    },
    required: ['courseId', 'eventId'],
    additionalProperties: false,
  },
} as const;

export async function runCreateCourseEvent(ctx: ToolContext, input: CreateCourseEventInput): Promise<ToolResult> {
  const { courseId, ...body } = input;
  const result = await ctx.client.post<unknown>(`/courses/${courseId}/events`, body);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Course event created in course ${courseId} (eventId=${input.eventId}).`;
}
