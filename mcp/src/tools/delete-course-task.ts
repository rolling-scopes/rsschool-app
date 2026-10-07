import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const deleteCourseTaskInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the course task to delete'),
});

export type DeleteCourseTaskInput = z.infer<typeof deleteCourseTaskInputSchema>;

export const DELETE_COURSE_TASK_TOOL = {
  name: 'delete_course_task',
  description:
    'Remove a task from the course schedule. DESTRUCTIVE — always name the exact task (see list_course_tasks) and get explicit user confirmation before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course task' },
    },
    required: ['courseId', 'courseTaskId'],
    additionalProperties: false,
  },
} as const;

export async function runDeleteCourseTask(ctx: ToolContext, input: DeleteCourseTaskInput): Promise<ToolResult> {
  const result = await ctx.client.delete<unknown>(`/courses/${input.courseId}/tasks/${input.courseTaskId}`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Course task ${input.courseTaskId} deleted from course ${input.courseId}.`;
}
