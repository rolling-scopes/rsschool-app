import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMyScoreInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetMyScoreInput = z.infer<typeof getMyScoreInputSchema>;

export const GET_MY_SCORE_TOOL = {
  name: 'get_my_score',
  description:
    'Get the score of the PAT user as a student in a course: total score, rank and per-task results. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyScore(ctx: ToolContext, input: GetMyScoreInput): Promise<string> {
  const result = await ctx.client.get<unknown>(
    `/course/${input.courseId}/students/score/${encodeURIComponent(ctx.user.githubId)}`,
  );
  if (!result.ok) {
    if (result.status === 404) {
      return `You are not a student of course ${input.courseId}, or the score is not available.`;
    }
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
