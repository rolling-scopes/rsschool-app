import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const submitMultipleScoresInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the course task'),
  scores: z
    .array(
      z.object({
        studentGithubId: z.string().min(1).describe('GitHub login of the student'),
        score: z.number().describe('Score to assign'),
        comment: z.string().optional().describe('Feedback comment'),
        githubPrUrl: z.string().url().optional().describe('URL of the reviewed pull request'),
      }),
    )
    .min(1)
    .describe('Scores to submit, one entry per student'),
});

export type SubmitMultipleScoresInput = z.infer<typeof submitMultipleScoresInputSchema>;

export const SUBMIT_MULTIPLE_SCORES_TOOL = {
  name: 'submit_multiple_scores',
  description:
    'Submit scores for multiple students of a course task in one call (task owner / mentor / manager). Show the user the full list of students and scores and get explicit confirmation before calling. Returns a per-student status report.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course task' },
      scores: {
        type: 'array',
        minItems: 1,
        description: 'Scores to submit, one entry per student',
        items: {
          type: 'object',
          properties: {
            studentGithubId: { type: 'string', minLength: 1, description: 'GitHub login of the student' },
            score: { type: 'number', description: 'Score to assign' },
            comment: { type: 'string', description: 'Feedback comment' },
            githubPrUrl: { type: 'string', format: 'uri', description: 'URL of the reviewed pull request' },
          },
          required: ['studentGithubId', 'score'],
        },
      },
    },
    required: ['courseId', 'courseTaskId', 'scores'],
    additionalProperties: false,
  },
} as const;

export async function runSubmitMultipleScores(ctx: ToolContext, input: SubmitMultipleScoresInput): Promise<string> {
  const result = await ctx.client.post<unknown[]>(
    `/course/${input.courseId}/students/score/task/${input.courseTaskId}/multiple`,
    input.scores,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return [`Submitted ${input.scores.length} score(s). Result:`, toJsonBlock(result.data)].join('\n');
}
