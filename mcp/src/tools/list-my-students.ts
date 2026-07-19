import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const listMyStudentsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course where the PAT user is a mentor'),
});

export type ListMyStudentsInput = z.infer<typeof listMyStudentsInputSchema>;

export const LIST_MY_STUDENTS_TOOL = {
  name: 'list_my_students',
  description:
    'List students assigned to the PAT user as a mentor. The mentor identity is taken from the session automatically. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runListMyStudents(ctx: ToolContext, input: ListMyStudentsInput): Promise<string> {
  const mentorId = ctx.user.courses.find(c => c.courseId === input.courseId)?.mentorId;
  if (!mentorId) {
    return `You are not a mentor of course ${input.courseId}.`;
  }
  const result = await ctx.client.get<{ students?: unknown[] } | unknown[]>(`/mentors/${mentorId}/students`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
