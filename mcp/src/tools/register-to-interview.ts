import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const registerToInterviewInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  interviewId: z.number().int().positive().describe('Numeric ID of the interview (see get_course_interviews)'),
});

export type RegisterToInterviewInput = z.infer<typeof registerToInterviewInputSchema>;

export const REGISTER_TO_INTERVIEW_TOOL = {
  name: 'register_to_interview',
  description:
    'Register the PAT user (student) for an interview. Registration must be open (check get_course_interviews for the registration window). Confirm the interview with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      interviewId: { type: 'integer', minimum: 1, description: 'Numeric ID of the interview' },
    },
    required: ['courseId', 'interviewId'],
    additionalProperties: false,
  },
} as const;

export async function runRegisterToInterview(ctx: ToolContext, input: RegisterToInterviewInput): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(`/courses/${input.courseId}/interviews/${input.interviewId}/register`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Registered for interview ${input.interviewId}.`;
}
