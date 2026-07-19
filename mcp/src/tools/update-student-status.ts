import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const updateStudentStatusInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  githubId: z.string().min(1).describe('GitHub login of the student'),
  status: z.enum(['expelled', 'active', 'self-study']).describe('New status for the student'),
  comment: z.string().optional().describe('Reason for the status change'),
});

export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusInputSchema>;

export const UPDATE_STUDENT_STATUS_TOOL = {
  name: 'update_student_status',
  description:
    'Change the status of a student in a course: expel, restore to active, or move to self-study. DESTRUCTIVE for "expelled" — always get explicit user confirmation with the student name and the reason before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      githubId: { type: 'string', minLength: 1, description: 'GitHub login of the student' },
      status: { type: 'string', enum: ['expelled', 'active', 'self-study'], description: 'New status' },
      comment: { type: 'string', description: 'Reason for the status change' },
    },
    required: ['courseId', 'githubId', 'status'],
    additionalProperties: false,
  },
} as const;

export async function runUpdateStudentStatus(ctx: ToolContext, input: UpdateStudentStatusInput): Promise<string> {
  const result = await ctx.client.post<unknown>(
    `/courses/${input.courseId}/students/${encodeURIComponent(input.githubId)}/status`,
    { status: input.status, comment: input.comment },
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Status of ${input.githubId} in course ${input.courseId} changed to "${input.status}".`;
}
