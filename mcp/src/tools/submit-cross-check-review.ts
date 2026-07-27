import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const submitCrossCheckReviewInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
  studentGithubId: z.string().min(1).describe('GitHub login of the student whose solution is being reviewed'),
  score: z.number().describe('Score to give for the solution'),
  comment: z.string().min(1).max(20000).describe('Review comment for the author'),
  anonymous: z.boolean().optional().describe('Hide the reviewer identity from the author'),
});

export type SubmitCrossCheckReviewInput = z.infer<typeof submitCrossCheckReviewInputSchema>;

export const SUBMIT_CROSS_CHECK_REVIEW_TOOL = {
  name: 'submit_cross_check_review',
  description:
    'Submit a cross-check review (score + comment) for a solution assigned to the PAT user (student). The target must be one of your assignments (see get_my_cross_check_assignments). Confirm the score and comment with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the cross-check course task' },
      studentGithubId: { type: 'string', minLength: 1, description: 'GitHub login of the reviewed student' },
      score: { type: 'number', description: 'Score to give' },
      comment: { type: 'string', minLength: 1, description: 'Review comment' },
      anonymous: { type: 'boolean', description: 'Hide the reviewer identity from the author' },
    },
    required: ['courseId', 'courseTaskId', 'studentGithubId', 'score', 'comment'],
    additionalProperties: false,
  },
} as const;

export async function runSubmitCrossCheckReview(
  ctx: ToolContext,
  input: SubmitCrossCheckReviewInput,
): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/results/${encodeURIComponent(input.studentGithubId)}`,
    { score: input.score, comment: input.comment, anonymous: input.anonymous ?? false },
  );
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Cross-check review submitted for ${input.studentGithubId}: score ${input.score}.`;
}
