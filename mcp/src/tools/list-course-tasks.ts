import { z } from 'zod';
import { describeError, type RsappApiClient } from '../api-client.js';

export const listCourseTasksInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
});

export type ListCourseTasksInput = z.infer<typeof listCourseTasksInputSchema>;

export const LIST_COURSE_TASKS_TOOL = {
  name: 'list_course_tasks',
  description:
    'List tasks of a course with their IDs and max scores. Use this when building certificate criteria so you can pick the courseTaskIds the user mentioned by name. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
    },
    required: ['courseId'],
    additionalProperties: false,
  },
} as const;

type CourseTaskRow = {
  id: number;
  name?: string | null;
  taskName?: string | null;
  maxScore?: number | null;
  scoreWeight?: number | null;
  type?: string | null;
};

export async function runListCourseTasks(client: RsappApiClient, input: ListCourseTasksInput): Promise<string> {
  const result = await client.get<CourseTaskRow[]>(`/api/v2/courses/${input.courseId}/tasks`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (result.data.length === 0) {
    return `Course ${input.courseId} has no tasks.`;
  }
  const rows = result.data.map(t =>
    [
      `- id=${t.id}`,
      `name=${t.taskName ?? t.name ?? '?'}`,
      t.maxScore != null ? `maxScore=${t.maxScore}` : null,
      t.scoreWeight != null ? `weight=${t.scoreWeight}` : null,
      t.type ? `type=${t.type}` : null,
    ]
      .filter(Boolean)
      .join(' | '),
  );
  return [`Course ${input.courseId} has ${result.data.length} task(s):`, ...rows].join('\n');
}
