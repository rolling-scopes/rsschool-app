import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMyCrossCheckResultInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
});

export type GetMyCrossCheckResultInput = z.infer<typeof getMyCrossCheckResultInputSchema>;

export const GET_MY_CROSS_CHECK_RESULT_TOOL = {
  name: 'get_my_cross_check_result',
  description:
    'Get the cross-check feedback the PAT user (student) received for a task: scores and reviewer comments. Read-only, no side effects.',
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

export async function runGetMyCrossCheckResult(
  ctx: ToolContext,
  input: GetMyCrossCheckResultInput,
): Promise<ToolResult> {
  const result = await ctx.client.get<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/results/${encodeURIComponent(ctx.user.githubId)}`,
  );
  if (!result.ok) {
    if (result.status === 404) {
      return toolError(`No cross-check result found for task ${input.courseTaskId}. The task may not be reviewed yet.`);
    }
    return toolError(describeError(result.status, result.message));
  }
  return toJsonBlock(result.data);
}
