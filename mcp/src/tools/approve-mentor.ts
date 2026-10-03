import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const approveMentorInputSchema = z.object({
  githubId: z.string().min(1).max(100).describe('GitHub login of the mentor applicant'),
  preselectedCourses: z
    .array(z.string().regex(/^\d+$/, 'must be a numeric course ID'))
    .max(100)
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

export async function runApproveMentor(ctx: ToolContext, input: ApproveMentorInput): Promise<ToolResult> {
  // The registry endpoint has no courseId in the path, so the central per-course
  // gate can't cover it. Enforce here that a non-admin only preselects courses
  // they manage or supervise (otherwise a manager of one course could approve a
  // mentor into an arbitrary other course).
  if (!ctx.user.isAdmin) {
    const scoped = new Set(
      ctx.user.courses
        .filter(course => course.roles.includes('manager') || course.roles.includes('supervisor'))
        .map(course => String(course.courseId)),
    );
    const outOfScope = input.preselectedCourses.filter(courseId => !scoped.has(courseId));
    if (outOfScope.length > 0) {
      return toolError(
        `Not authorized: you may only preselect courses you manage or supervise. Not allowed: ${outOfScope.join(', ')}.`,
      );
    }
  }
  const result = await ctx.client.put<unknown>(`/registry/mentor/${encodeURIComponent(input.githubId)}`, {
    preselectedCourses: input.preselectedCourses,
  });
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Mentor ${input.githubId} approved for courses: ${input.preselectedCourses.join(', ') || '(none)'}.`;
}
