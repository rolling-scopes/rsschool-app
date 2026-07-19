import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getCourseStatsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetCourseStatsInput = z.infer<typeof getCourseStatsInputSchema>;

export const GET_COURSE_STATS_TOOL = {
  name: 'get_course_stats',
  description:
    'Get aggregate statistics of a course: student counts, activity and certification numbers. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetCourseStats(ctx: ToolContext, input: GetCourseStatsInput): Promise<string> {
  const result = await ctx.client.get<unknown>(`/courses/${input.courseId}/stats`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
