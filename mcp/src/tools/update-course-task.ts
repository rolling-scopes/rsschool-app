import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';
import { courseTaskFieldsJsonSchemaProperties, courseTaskFieldsSchema } from './course-task-fields.js';

export const updateCourseTaskInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the course task to update'),
  ...courseTaskFieldsSchema,
});

export type UpdateCourseTaskInput = z.infer<typeof updateCourseTaskInputSchema>;

export const UPDATE_COURSE_TASK_TOOL = {
  name: 'update_course_task',
  description:
    'Update a course task: dates, checker, scoring. Only the provided fields are changed. Confirm the changes with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course task' },
      ...courseTaskFieldsJsonSchemaProperties,
    },
    required: ['courseId', 'courseTaskId'],
    additionalProperties: false,
  },
} as const;

export async function runUpdateCourseTask(ctx: ToolContext, input: UpdateCourseTaskInput): Promise<string> {
  const { courseId, courseTaskId, ...fields } = input;
  const body = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  if (Object.keys(body).length === 0) {
    return 'Nothing to update: provide at least one field.';
  }
  const result = await ctx.client.put<unknown>(`/courses/${courseId}/tasks/${courseTaskId}`, body);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Course task ${courseTaskId} updated (${Object.keys(body).join(', ')}).`;
}
