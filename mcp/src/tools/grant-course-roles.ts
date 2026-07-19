import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';

export const grantCourseRolesInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  githubId: z.string().min(1).describe('GitHub login of the user'),
  isManager: z.boolean().optional().describe('Grant/revoke the course manager role'),
  isSupervisor: z.boolean().optional().describe('Grant/revoke the course supervisor role'),
  isDementor: z.boolean().optional().describe('Grant/revoke the course dementor role'),
  isActivist: z.boolean().optional().describe('Grant/revoke the course activist role'),
});

export type GrantCourseRolesInput = z.infer<typeof grantCourseRolesInputSchema>;

export const GRANT_COURSE_ROLES_TOOL = {
  name: 'grant_course_roles',
  description:
    'Set course-level roles (manager / supervisor / dementor / activist) for a user. Roles not provided keep their current value on the backend payload as false — always state the exact final role set and get explicit user confirmation before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      githubId: { type: 'string', minLength: 1, description: 'GitHub login of the user' },
      isManager: { type: 'boolean', description: 'Grant/revoke the course manager role' },
      isSupervisor: { type: 'boolean', description: 'Grant/revoke the course supervisor role' },
      isDementor: { type: 'boolean', description: 'Grant/revoke the course dementor role' },
      isActivist: { type: 'boolean', description: 'Grant/revoke the course activist role' },
    },
    required: ['courseId', 'githubId'],
    additionalProperties: false,
  },
} as const;

export async function runGrantCourseRoles(ctx: ToolContext, input: GrantCourseRolesInput): Promise<string> {
  const roles = {
    isManager: input.isManager ?? false,
    isSupervisor: input.isSupervisor ?? false,
    isDementor: input.isDementor ?? false,
    isActivist: input.isActivist ?? false,
  };
  const result = await ctx.client.put<unknown>(
    `/courses/${input.courseId}/users/${encodeURIComponent(input.githubId)}`,
    roles,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const granted = Object.entries(roles)
    .filter(([, value]) => value)
    .map(([key]) => key.replace('is', '').toLowerCase());
  return `Roles of ${input.githubId} in course ${input.courseId} set to: ${granted.join(', ') || '(none)'}.`;
}
