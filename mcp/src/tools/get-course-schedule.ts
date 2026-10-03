import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const getCourseScheduleInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  upcomingOnly: z.boolean().optional().describe('When true, return only items whose end date is in the future'),
});

export type GetCourseScheduleInput = z.infer<typeof getCourseScheduleInputSchema>;

export const GET_COURSE_SCHEDULE_TOOL = {
  name: 'get_course_schedule',
  description:
    'Get the schedule of a course: tasks and events with start/end dates, status and scores. Use upcomingOnly=true to see only future deadlines. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      upcomingOnly: {
        type: 'boolean',
        description: 'When true, return only items whose end date is in the future',
      },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

type ScheduleItem = {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  score?: number | null;
  maxScore?: number | null;
  tag?: string;
};

export async function runGetCourseSchedule(ctx: ToolContext, input: GetCourseScheduleInput): Promise<ToolResult> {
  const result = await ctx.client.get<ScheduleItem[]>(`/courses/${input.courseId}/schedule`);
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  let items = result.data;
  if (input.upcomingOnly) {
    const now = Date.now();
    items = items.filter(item => (item.endDate ? Date.parse(item.endDate) >= now : false));
  }
  if (items.length === 0) {
    return input.upcomingOnly
      ? `Course ${input.courseId} has no upcoming schedule items.`
      : `Course ${input.courseId} has no schedule items.`;
  }
  return [`${items.length} schedule item(s):`, toJsonBlock(items)].join('\n');
}
