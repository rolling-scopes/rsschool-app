import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const approveMentorInputSchema = z.object({
  githubId: z.string().min(1).describe('GitHub login of the mentor applicant'),
  preselectedCourses: z
    .array(z.string())
    .describe('Course IDs (as strings) the mentor is approved for, e.g. ["123", "456"]'),
});

export type ApproveMentorInput = z.infer<typeof approveMentorInputSchema>;

export const APPROVE_MENTOR_TOOL = {
  name: 'approve_mentor',
  description:
    'Approve a mentor registration application and preselect courses for the mentor. See list_mentor_registry for applicants. Confirm the applicant and courses with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      githubId: { type: 'string', minLength: 1, description: 'GitHub login of the mentor applicant' },
      preselectedCourses: {
        type: 'array',
        items: { type: 'string' },
        description: 'Course IDs (as strings) the mentor is approved for',
      },
    },
    required: ['githubId', 'preselectedCourses'],
    additionalProperties: false,
  },
} as const;

export async function runApproveMentor(ctx: ToolContext, input: ApproveMentorInput): Promise<string> {
  const result = await ctx.client.put<unknown>(`/registry/mentor/${encodeURIComponent(input.githubId)}`, {
    preselectedCourses: input.preselectedCourses,
  });
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Mentor ${input.githubId} approved for courses: ${input.preselectedCourses.join(', ') || '(none)'}.`;
}
