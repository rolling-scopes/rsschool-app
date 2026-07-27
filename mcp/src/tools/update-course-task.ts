import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';
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

export async function runUpdateCourseTask(ctx: ToolContext, input: UpdateCourseTaskInput): Promise<ToolResult> {
  const { courseId, courseTaskId, ...fields } = input;
  const provided = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  if (Object.keys(provided).length === 0) {
    return toolError('Nothing to update: provide at least one field.');
  }
  const body: Record<string, unknown> = { ...provided };
  // The backend PUT requires studentStartDate and studentEndDate on every call
  // (they are @IsNotEmpty), so a partial update that omits them would 400.
  // Carry the current task's dates over so callers can change just one field.
  if (body.studentStartDate === undefined || body.studentEndDate === undefined) {
    const current = await ctx.client.get<{ studentStartDate?: string; studentEndDate?: string }>(
      `/courses/${courseId}/tasks/${courseTaskId}`,
    );
    if (!current.ok) {
      return toolError(describeError(current.status, current.message));
    }
    body.studentStartDate ??= current.data?.studentStartDate;
    body.studentEndDate ??= current.data?.studentEndDate;
  }
  const result = await ctx.client.put<unknown>(`/courses/${courseId}/tasks/${courseTaskId}`, body);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  // Report only the fields the caller actually changed, not the carried-over dates.
  return `Course task ${courseTaskId} updated (${Object.keys(provided).join(', ')}).`;
}
