import { z } from 'zod';
import { describeError } from '../api-client.js';
import type { ToolContext } from '../types.js';
import { courseTaskFieldsJsonSchemaProperties, courseTaskFieldsSchema } from './course-task-fields.js';

export const createCourseTaskInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  taskId: z.number().int().positive().describe('ID of the task from the tasks catalog to add to the course'),
  checker: courseTaskFieldsSchema.checker.unwrap().describe('Who checks the task'),
  studentStartDate: z.string().describe('ISO date when the task opens'),
  studentEndDate: z.string().describe('ISO date of the deadline'),
  maxScore: courseTaskFieldsSchema.maxScore,
  scoreWeight: courseTaskFieldsSchema.scoreWeight,
  crossCheckEndDate: courseTaskFieldsSchema.crossCheckEndDate,
  taskOwnerId: courseTaskFieldsSchema.taskOwnerId,
  pairsCount: courseTaskFieldsSchema.pairsCount,
  type: courseTaskFieldsSchema.type,
  submitText: courseTaskFieldsSchema.submitText,
});

export type CreateCourseTaskInput = z.infer<typeof createCourseTaskInputSchema>;

export const CREATE_COURSE_TASK_TOOL = {
  name: 'create_course_task',
  description:
    'Add a task from the tasks catalog to a course schedule with dates, checker and scoring. Confirm the task and dates with the user before calling.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      taskId: { type: 'integer', minimum: 1, description: 'ID of the task from the tasks catalog' },
      ...courseTaskFieldsJsonSchemaProperties,
    },
    required: ['courseId', 'taskId', 'checker', 'studentStartDate', 'studentEndDate'],
    additionalProperties: false,
  },
} as const;

export async function runCreateCourseTask(ctx: ToolContext, input: CreateCourseTaskInput): Promise<string> {
  const { courseId, ...body } = input;
  const result = await ctx.client.post<unknown>(`/courses/${courseId}/tasks`, body);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return `Course task created in course ${courseId} (taskId=${input.taskId}).`;
}
