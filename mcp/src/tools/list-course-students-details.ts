import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const listCourseStudentsDetailsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  activeOnly: z.boolean().optional().describe('When true, return only active (not expelled) students'),
  limit: z.number().int().positive().max(200).optional().describe('Max students to return (default 50)'),
});

export type ListCourseStudentsDetailsInput = z.infer<typeof listCourseStudentsDetailsInputSchema>;

export const LIST_COURSE_STUDENTS_DETAILS_TOOL = {
  name: 'list_course_students_details',
  description:
    'List students of a course with details: score, status, mentor, contacts. Requires supervisor / manager / dementor role in the course, or admin. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      activeOnly: { type: 'boolean', description: 'When true, return only active (not expelled) students' },
      limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Max students to return (default 50)' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

const DEFAULT_LIMIT = 50;

export async function runListCourseStudentsDetails(
  ctx: ToolContext,
  input: ListCourseStudentsDetailsInput,
): Promise<string> {
  const query = input.activeOnly ? '?status=active' : '';
  const result = await ctx.client.get<unknown[]>(`/courses/${input.courseId}/students/details${query}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const total = result.data.length;
  if (total === 0) {
    return `Course ${input.courseId} has no matching students.`;
  }
  const limit = input.limit ?? DEFAULT_LIMIT;
  const shown = result.data.slice(0, limit);
  const suffix = total > shown.length ? `\n…and ${total - shown.length} more (raise "limit" to see them)` : '';
  return [`${total} student(s), showing ${shown.length}:`, toJsonBlock(shown)].join('\n') + suffix;
}
