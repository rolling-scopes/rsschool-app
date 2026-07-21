import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const submitTaskSolutionInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the course task (see list_course_tasks)'),
  url: z.string().url().describe('URL of the solution (repository, deployed app, etc.)'),
});

export type SubmitTaskSolutionInput = z.infer<typeof submitTaskSolutionInputSchema>;

export const SUBMIT_TASK_SOLUTION_TOOL = {
  name: 'submit_task_solution',
  description:
    'Submit (or update) the solution URL for a course task as the PAT user (student). Confirm the exact task and URL with the user before calling. The deadline must not have passed.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course task' },
      url: { type: 'string', format: 'uri', description: 'URL of the solution' },
    },
    required: ['courseId', 'courseTaskId', 'url'],
    additionalProperties: false,
  },
} as const;

export async function runSubmitTaskSolution(ctx: ToolContext, input: SubmitTaskSolutionInput): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(`/courses/${input.courseId}/tasks/${input.courseTaskId}/solutions`, {
    url: input.url,
  });
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Solution submitted for course task ${input.courseTaskId}: ${input.url}`;
}
