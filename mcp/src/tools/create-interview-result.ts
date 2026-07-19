import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const createInterviewResultInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the interview course task'),
  studentGithubId: z.string().min(1).describe('GitHub login of the interviewed student'),
  score: z.number().describe('Interview score'),
  comment: z.string().optional().describe('Interview comment'),
});

export type CreateInterviewResultInput = z.infer<typeof createInterviewResultInputSchema>;

export const CREATE_INTERVIEW_RESULT_TOOL = {
  name: 'create_interview_result',
  description:
    'Submit the result (score + comment) of a regular interview conducted by the PAT user (mentor) for a student. Confirm the student and score with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the interview course task' },
      studentGithubId: { type: 'string', minLength: 1, description: 'GitHub login of the interviewed student' },
      score: { type: 'number', description: 'Interview score' },
      comment: { type: 'string', description: 'Interview comment' },
    },
    required: ['courseId', 'courseTaskId', 'studentGithubId', 'score'],
    additionalProperties: false,
  },
} as const;

export async function runCreateInterviewResult(ctx: ToolContext, input: CreateInterviewResultInput): Promise<string> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/interviews/${input.courseTaskId}/students/${encodeURIComponent(input.studentGithubId)}/result`,
    { score: input.score, comment: input.comment },
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Interview result saved for ${input.studentGithubId}: score ${input.score}.`;
}
