import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getCourseInterviewsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetCourseInterviewsInput = z.infer<typeof getCourseInterviewsInputSchema>;

export const GET_COURSE_INTERVIEWS_TOOL = {
  name: 'get_course_interviews',
  description:
    'List interview events of a course with registration windows and descriptions. Useful to see which interviews are available or upcoming. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetCourseInterviews(ctx: ToolContext, input: GetCourseInterviewsInput): Promise<string> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/interviews`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (result.data.length === 0) {
    return `Course ${input.courseId} has no interviews.`;
  }
  return toJsonBlock(result.data);
}
