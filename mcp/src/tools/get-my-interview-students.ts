import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMyInterviewStudentsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type GetMyInterviewStudentsInput = z.infer<typeof getMyInterviewStudentsInputSchema>;

export const GET_MY_INTERVIEW_STUDENTS_TOOL = {
  name: 'get_my_interview_students',
  description:
    'List students assigned to the PAT user (mentor) for stage interviews in a course. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyInterviewStudents(ctx: ToolContext, input: GetMyInterviewStudentsInput): Promise<string> {
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/interviews/stage/interviewer/me/students`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return 'No students are assigned to you for stage interviews.';
  }
  return toJsonBlock(result.data);
}
