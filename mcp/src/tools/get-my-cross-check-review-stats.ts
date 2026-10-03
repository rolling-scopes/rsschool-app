import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMyCrossCheckReviewStatsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetMyCrossCheckReviewStatsInput = z.infer<typeof getMyCrossCheckReviewStatsInputSchema>;

export const GET_MY_CROSS_CHECK_REVIEW_STATS_TOOL = {
  name: 'get_my_cross_check_review_stats',
  description:
    'Show cross-check reviews the PAT user (student) still has to complete for currently open cross-check tasks. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyCrossCheckReviewStats(
  ctx: ToolContext,
  input: GetMyCrossCheckReviewStatsInput,
): Promise<ToolResult> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/cross-checks/available-review-stats`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  if (result.data.length === 0) {
    return 'No open cross-check tasks right now.';
  }
  return toJsonBlock(result.data);
}
