import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMyCrossCheckAssignmentsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the cross-check course task'),
});

export type GetMyCrossCheckAssignmentsInput = z.infer<typeof getMyCrossCheckAssignmentsInputSchema>;

export const GET_MY_CROSS_CHECK_ASSIGNMENTS_TOOL = {
  name: 'get_my_cross_check_assignments',
  description:
    'List the solutions assigned to the PAT user (student) for cross-check review: whose work to check and the solution URLs. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the cross-check course task' },
    },
    required: ['courseId', 'courseTaskId'],
    additionalProperties: false,
  },
} as const;

export async function runGetMyCrossCheckAssignments(
  ctx: ToolContext,
  input: GetMyCrossCheckAssignmentsInput,
): Promise<string> {
  const result = await ctx.client.get<unknown[]>(
    `/courses/${input.courseId}/cross-checks/${input.courseTaskId}/assignments/me`,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (Array.isArray(result.data) && result.data.length === 0) {
    return 'No cross-check assignments for this task.';
  }
  return toJsonBlock(result.data);
}
