import { z } from 'zod';
import { describeError, type RsappApiClient } from '../api-client.js';

export const listMyCoursesInputSchema = z.object({});

export type ListMyCoursesInput = z.infer<typeof listMyCoursesInputSchema>;

export const LIST_MY_COURSES_TOOL = {
  name: 'list_my_courses',
  description:
    'List courses the PAT user can manage. Returns courses where the user is a course manager, or all courses if the user is an admin. Use this first to find the courseId for other tools. Read-only, no side effects.',
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

export async function runListMyCourses(client: RsappApiClient, _input: ListMyCoursesInput): Promise<string> {
  const result = await client.get<CourseRow[]>('/api/v2/courses/managed-by-me');
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (result.data.length === 0) {
    return 'You do not manage any courses. Only course managers and admins can issue certificates.';
  }
  const rows = result.data.map(c =>
    [
      `- ${c.name}`,
      `id=${c.id}`,
      c.alias ? `alias=${c.alias}` : null,
      c.discipline?.name ? `discipline=${c.discipline.name}` : null,
      c.startDate ? `start=${c.startDate.slice(0, 10)}` : null,
      c.endDate ? `end=${c.endDate.slice(0, 10)}` : null,
      c.completed ? 'completed' : 'active',
    ]
      .filter(Boolean)
      .join(' | '),
  );
  return [`Found ${result.data.length} course(s):`, ...rows].join('\n');
}
