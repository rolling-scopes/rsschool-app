import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMyInterviewsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetMyInterviewsInput = z.infer<typeof getMyInterviewsInputSchema>;

export const GET_MY_INTERVIEWS_TOOL = {
  name: 'get_my_interviews',
  description:
    'List interviews of the PAT user as a student in a course: assigned interviewers, dates and results. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyInterviews(ctx: ToolContext, input: GetMyInterviewsInput): Promise<string> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/interviews/students/me`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return 'You have no interviews in this course.';
  }
  return toJsonBlock(result.data);
}
