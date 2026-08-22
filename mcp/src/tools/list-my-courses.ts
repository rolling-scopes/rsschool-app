import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const listMyCoursesInputSchema = z.object({});

export type ListMyCoursesInput = z.infer<typeof listMyCoursesInputSchema>;

export const LIST_MY_COURSES_TOOL = {
  name: 'list_my_courses',
  description:
    'List courses the PAT user participates in, with their roles in each (student, mentor, manager, …). Admins get every course. Use this first to find the courseId for other tools. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
} as const;

type CourseRow = {
  id: number;
  name: string;
  alias?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  completed?: boolean;
  discipline?: { name?: string | null } | null;
};

function formatCourse(c: CourseRow, roles?: string[]): string {
  return [
    `- ${c.name}`,
    `id=${c.id}`,
    roles?.length ? `roles=${roles.join(',')}` : null,
    c.alias ? `alias=${c.alias}` : null,
    c.discipline?.name ? `discipline=${c.discipline.name}` : null,
    c.startDate ? `start=${c.startDate.slice(0, 10)}` : null,
    c.endDate ? `end=${c.endDate.slice(0, 10)}` : null,
    c.completed ? 'completed' : 'active',
  ]
    .filter(Boolean)
    .join(' | ');
}

export async function runListMyCourses(ctx: ToolContext, _input: ListMyCoursesInput): Promise<ToolResult> {
  const result = await ctx.client.get<CourseRow[]>('/courses');
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }

  if (ctx.user.isAdmin) {
    const rows = result.data.map(c => formatCourse(c));
    return [`You are an admin with access to all ${result.data.length} course(s):`, ...rows].join('\n');
  }

  const memberships = new Map(ctx.user.courses.map(c => [c.courseId, c]));
  const mine = result.data.filter(c => memberships.has(c.id));
  if (mine.length === 0) {
    return 'You are not a member of any course.';
  }
  const rows = mine.map(c => {
    const membership = memberships.get(c.id);
    const roles = membership?.roles.map(role =>
      role === 'student' && membership.isExpelled ? 'student(expelled)' : role,
    );
    return formatCourse(c, roles);
  });
  return [`You participate in ${mine.length} course(s):`, ...rows].join('\n');
}
