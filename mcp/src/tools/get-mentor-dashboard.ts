import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getMentorDashboardInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course where the PAT user is a mentor'),
});

export type GetMentorDashboardInput = z.infer<typeof getMentorDashboardInputSchema>;

export const GET_MENTOR_DASHBOARD_TOOL = {
  name: 'get_mentor_dashboard',
  description:
    'Get the mentor dashboard of the PAT user for a course: submitted solutions waiting for review, tasks to check and student progress. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMentorDashboard(ctx: ToolContext, input: GetMentorDashboardInput): Promise<ToolResult> {
  const mentorId = ctx.user.courses.find(c => c.courseId === input.courseId)?.mentorId;
  if (!mentorId) {
    return toolError(`You are not a mentor of course ${input.courseId}.`);
  }
  const result = await ctx.client.get<unknown[]>(`/mentors/${mentorId}/course/${input.courseId}/dashboard`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return 'Nothing to review right now — the dashboard is empty.';
  }
  return toJsonBlock(result.data);
}
