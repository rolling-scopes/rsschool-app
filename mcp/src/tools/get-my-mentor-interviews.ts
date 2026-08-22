import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMyMentorInterviewsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetMyMentorInterviewsInput = z.infer<typeof getMyMentorInterviewsInputSchema>;

export const GET_MY_MENTOR_INTERVIEWS_TOOL = {
  name: 'get_my_mentor_interviews',
  description:
    'List interviews where the PAT user is the interviewer (mentor) in a course: students, dates and completion status. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyMentorInterviews(
  ctx: ToolContext,
  input: GetMyMentorInterviewsInput,
): Promise<ToolResult> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/interviews/mentors/me`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return 'You have no interviews as an interviewer in this course.';
  }
  return toJsonBlock(result.data);
}
