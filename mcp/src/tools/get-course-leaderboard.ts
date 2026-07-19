import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getCourseLeaderboardInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  page: z.number().int().positive().optional().describe('Page number (default 1)'),
  pageSize: z.number().int().positive().max(100).optional().describe('Page size (default 20)'),
  activeOnly: z.boolean().optional().describe('Only active students (default true)'),
  githubId: z.string().optional().describe('Filter by GitHub login (partial match)'),
});

export type GetCourseLeaderboardInput = z.infer<typeof getCourseLeaderboardInputSchema>;

export const GET_COURSE_LEADERBOARD_TOOL = {
  name: 'get_course_leaderboard',
  description:
    'Get the course score leaderboard: students ranked by total score, paginated. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      page: { type: 'integer', minimum: 1, description: 'Page number (default 1)' },
      pageSize: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size (default 20)' },
      activeOnly: { type: 'boolean', description: 'Only active students (default true)' },
      githubId: { type: 'string', description: 'Filter by GitHub login (partial match)' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetCourseLeaderboard(ctx: ToolContext, input: GetCourseLeaderboardInput): Promise<string> {
  const params = new URLSearchParams({
    activeOnly: String(input.activeOnly ?? true),
    orderBy: 'rank',
    orderDirection: 'asc',
    current: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20),
  });
  if (input.githubId) {
    params.set('githubId', input.githubId);
  }
  const result = await ctx.client.get<unknown>(`/course/${input.courseId}/students/score?${params.toString()}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
