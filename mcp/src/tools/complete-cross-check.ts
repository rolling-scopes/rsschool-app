import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const completeCrossCheckInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
});

export type CompleteCrossCheckInput = z.infer<typeof completeCrossCheckInputSchema>;

export const COMPLETE_CROSS_CHECK_TOOL = {
  name: 'complete_cross_check',
  description:
    'Complete a cross-check task: finalize scores from peer reviews. Run after the review deadline. Confirm the task with the user before calling.',
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

export async function runCompleteCrossCheck(ctx: ToolContext, input: CompleteCrossCheckInput): Promise<string> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/completion`,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Cross-check completion started for task ${input.courseTaskId}.`;
}
