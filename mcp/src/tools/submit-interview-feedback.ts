import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const submitInterviewFeedbackInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  interviewId: z.number().int().positive().describe('Numeric ID of the stage interview pair'),
  version: z.number().int().nonnegative().describe('Feedback form version (see get_interview_feedback)'),
  json: z.record(z.unknown()).describe('Feedback form answers as a JSON object'),
  decision: z.string().optional().describe('Decision, e.g. "yes", "no", "draft"'),
  isGoodCandidate: z.boolean().optional().describe('Whether the student is a good candidate'),
  isCompleted: z.boolean().optional().describe('Mark the feedback as completed'),
});

export type SubmitInterviewFeedbackInput = z.infer<typeof submitInterviewFeedbackInputSchema>;

export const SUBMIT_INTERVIEW_FEEDBACK_TOOL = {
  name: 'submit_interview_feedback',
  description:
    'Save (upsert) stage interview feedback as the interviewing mentor: form answers, decision and completion flag. Get the current form via get_interview_feedback first. Confirm the decision with the user before submitting a completed feedback.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      interviewId: { type: 'integer', minimum: 1, description: 'Numeric ID of the stage interview pair' },
      version: { type: 'integer', minimum: 0, description: 'Feedback form version' },
      json: { type: 'object', description: 'Feedback form answers as a JSON object' },
      decision: { type: 'string', description: 'Decision, e.g. "yes", "no", "draft"' },
      isGoodCandidate: { type: 'boolean', description: 'Whether the student is a good candidate' },
      isCompleted: { type: 'boolean', description: 'Mark the feedback as completed' },
    },
    required: ['courseId', 'interviewId', 'version', 'json'],
    additionalProperties: false,
  },
} as const;

export async function runSubmitInterviewFeedback(
  ctx: ToolContext,
  input: SubmitInterviewFeedbackInput,
): Promise<string> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/interviews/${input.interviewId}/stage-interview/feedback`,
    {
      version: input.version,
      json: input.json,
      decision: input.decision,
      isGoodCandidate: input.isGoodCandidate,
      isCompleted: input.isCompleted,
    },
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Interview feedback saved for interview ${input.interviewId}.`;
}
