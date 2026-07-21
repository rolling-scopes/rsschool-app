import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const expelStudentsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  criteria: z
    .object({
      courseTaskIds: z.array(z.number().int().positive()).optional().describe('Course task IDs the criteria apply to'),
      minScore: z.number().optional().describe('Students below this score are expelled'),
    })
    .describe('Criteria selecting which students to expel'),
  keepWithMentor: z.boolean().optional().describe('Keep expelled students attached to their mentor'),
});

export type ExpelStudentsInput = z.infer<typeof expelStudentsInputSchema>;

export const EXPEL_STUDENTS_TOOL = {
  name: 'expel_students',
  description:
    'Bulk-expel students of a course matching the criteria (e.g. score below a threshold). DESTRUCTIVE and hard to undo at scale — always show the user which criteria will be applied and get explicit confirmation before calling. Check list_course_students_details first to estimate the impact.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      criteria: {
        type: 'object',
        properties: {
          courseTaskIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 },
            description: 'Course task IDs the criteria apply to',
          },
          minScore: { type: 'number', description: 'Students below this score are expelled' },
        },
        description: 'Criteria selecting which students to expel',
      },
      keepWithMentor: { type: 'boolean', description: 'Keep expelled students attached to their mentor' },
    },
    required: ['courseId', 'criteria'],
    additionalProperties: false,
  },
} as const;

export async function runExpelStudents(ctx: ToolContext, input: ExpelStudentsInput): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(`/courses/${input.courseId}/students/expel`, {
    criteria: input.criteria,
    options: { keepWithMentor: input.keepWithMentor },
  });
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return ['Expulsion completed.', toJsonBlock(result.data)].join('\n');
}
