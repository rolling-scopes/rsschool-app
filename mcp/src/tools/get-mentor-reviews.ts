import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMentorReviewsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  page: z.number().int().positive().optional().describe('Page number (default 1)'),
  pageSize: z.number().int().positive().max(100).optional().describe('Page size (default 20)'),
});

export type GetMentorReviewsInput = z.infer<typeof getMentorReviewsInputSchema>;

export const GET_MENTOR_REVIEWS_TOOL = {
  name: 'get_mentor_reviews',
  description:
    'List task reviews done by mentors in a course (who checked what and when). For dementors and managers overseeing mentor activity. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      page: { type: 'integer', minimum: 1, description: 'Page number (default 1)' },
      pageSize: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size (default 20)' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMentorReviews(ctx: ToolContext, input: GetMentorReviewsInput): Promise<string> {
  const params = new URLSearchParams({
    current: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });
  const result = await ctx.client.get<unknown>(`/course/${input.courseId}/mentor-reviews?${params.toString()}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
