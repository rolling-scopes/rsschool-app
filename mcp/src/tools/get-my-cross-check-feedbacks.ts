import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMyCrossCheckFeedbacksInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
});

export type GetMyCrossCheckFeedbacksInput = z.infer<typeof getMyCrossCheckFeedbacksInputSchema>;

export const GET_MY_CROSS_CHECK_FEEDBACKS_TOOL = {
  name: 'get_my_cross_check_feedbacks',
  description:
    'Get the reviews the PAT user (student) received for their own solution of a cross-check task: scores and reviewer comments. Read-only, no side effects.',
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

export async function runGetMyCrossCheckFeedbacks(
  ctx: ToolContext,
  input: GetMyCrossCheckFeedbacksInput,
): Promise<ToolResult> {
  const result = await ctx.client.get<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/feedbacks/my`,
  );
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return toJsonBlock(result.data);
}
