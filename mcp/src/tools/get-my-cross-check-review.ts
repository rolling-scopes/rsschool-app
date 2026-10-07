import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMyCrossCheckReviewInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
  studentGithubId: z.string().min(1).describe('GitHub login of the student whose solution you reviewed'),
});

export type GetMyCrossCheckReviewInput = z.infer<typeof getMyCrossCheckReviewInputSchema>;

export const GET_MY_CROSS_CHECK_REVIEW_TOOL = {
  name: 'get_my_cross_check_review',
  description:
    'Get the cross-check review the PAT user (student) submitted for a peer: score, comment and message thread. The peer must be one of your assignments (see get_my_cross_check_assignments). To read the reviews you received on your own solution, use get_my_cross_check_feedbacks instead. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the cross-check course task' },
      studentGithubId: {
        type: 'string',
        minLength: 1,
        description: 'GitHub login of the student whose solution you reviewed',
      },
    },
    required: ['courseId', 'courseTaskId', 'studentGithubId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyCrossCheckReview(
  ctx: ToolContext,
  input: GetMyCrossCheckReviewInput,
): Promise<ToolResult> {
  const result = await ctx.client.get<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/results/${encodeURIComponent(input.studentGithubId)}`,
  );
  if (!result.ok) {
    // The backend answers 400 (not 404) when the pair isn't an assignment of yours.
    if (result.status === 400) {
      return toolError(
        `Cannot read a review for "${input.studentGithubId}": you were not assigned to check this solution, or task ${input.courseTaskId} is not a cross-check task.`,
      );
    }
    return toolError(describeError(result.status, result.message));
  }
  // getResult returns null until a review has actually been submitted.
  if (result.data === null) {
    return `You have not submitted a review for ${input.studentGithubId} on task ${input.courseTaskId} yet.`;
  }
  return toJsonBlock(result.data);
}
