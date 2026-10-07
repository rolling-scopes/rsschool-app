import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const createStageInterviewsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  noRegistration: z
    .boolean()
    .optional()
    .describe('Pair students even if they did not register for the interview (default false)'),
});

export type CreateStageInterviewsInput = z.infer<typeof createStageInterviewsInputSchema>;

export const CREATE_STAGE_INTERVIEWS_TOOL = {
  name: 'create_stage_interviews',
  description:
    'Automatically create stage interview pairs (mentor ↔ student) for a course. Confirm with the user before calling — this notifies mentors and students.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      noRegistration: {
        type: 'boolean',
        description: 'Pair students even if they did not register for the interview (default false)',
      },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runCreateStageInterviews(
  ctx: ToolContext,
  input: CreateStageInterviewsInput,
): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(`/courses/${input.courseId}/interviews/stage`, {
    noRegistration: input.noRegistration ?? false,
  });
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Stage interview pairs created for course ${input.courseId}.`;
}
