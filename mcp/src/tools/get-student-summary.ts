import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { isContactKey, isSecretKey, redactKeys } from '../redact.js';
import type { ToolContext } from '../types.js';

export const getStudentSummaryInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  githubId: z.string().min(1).describe('GitHub login of the student'),
});

export type GetStudentSummaryInput = z.infer<typeof getStudentSummaryInputSchema>;

export const GET_STUDENT_SUMMARY_TOOL = {
  name: 'get_student_summary',
  description:
    'Get a summary for a student in a course: total score, rank, active status and assigned mentor. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      githubId: { type: 'string', minLength: 1, description: 'GitHub login of the student' },
    },
    required: ['courseId', 'githubId'],
    additionalProperties: false,
  },
} as const;

export async function runGetStudentSummary(ctx: ToolContext, input: GetStudentSummaryInput): Promise<string> {
  const result = await ctx.client.get<unknown>(
    `/courses/${input.courseId}/students/${encodeURIComponent(input.githubId)}/summary`,
  );
  if (!result.ok) {
    if (result.status === 404) {
      return `Student "${input.githubId}" not found in course ${input.courseId}.`;
    }
    return describeError(result.status, result.message);
  }
  // A score/rank summary needs the mentor's identity, not their personal
  // contacts — drop contact fields (and any secret) before returning.
  const safe = redactKeys(result.data, key => isSecretKey(key) || isContactKey(key));
  return toJsonBlock(safe);
}
