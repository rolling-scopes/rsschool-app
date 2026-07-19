import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getInterviewFeedbackInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  interviewId: z.number().int().positive().describe('Numeric ID of the stage interview pair'),
});

export type GetInterviewFeedbackInput = z.infer<typeof getInterviewFeedbackInputSchema>;

export const GET_INTERVIEW_FEEDBACK_TOOL = {
  name: 'get_interview_feedback',
  description:
    'Get the feedback form (template + saved answers) for a stage interview conducted by the PAT user. Only stage interviews are supported. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      interviewId: { type: 'integer', minimum: 1, description: 'Numeric ID of the stage interview pair' },
    },
    required: ['courseId', 'interviewId'],
    additionalProperties: false,
  },
} as const;

export async function runGetInterviewFeedback(ctx: ToolContext, input: GetInterviewFeedbackInput): Promise<string> {
  const result = await ctx.client.get<unknown>(
    `/courses/${input.courseId}/interviews/${input.interviewId}/stage-interview/feedback`,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
