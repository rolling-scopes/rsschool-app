import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const createCrossCheckDistributionInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
});

export type CreateCrossCheckDistributionInput = z.infer<typeof createCrossCheckDistributionInputSchema>;

export const CREATE_CROSS_CHECK_DISTRIBUTION_TOOL = {
  name: 'create_cross_check_distribution',
  description:
    'Distribute submitted solutions of a cross-check task between students for peer review. Run after the submission deadline. Confirm the task with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the cross-check course task' },
    },
    required: ['courseId', 'courseTaskId'],
    additionalProperties: false,
  },
} as const;

export async function runCreateCrossCheckDistribution(
  ctx: ToolContext,
  input: CreateCrossCheckDistributionInput,
): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/distribution`,
  );
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Cross-check distribution started for task ${input.courseTaskId}.`;
}
