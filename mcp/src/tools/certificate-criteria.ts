import { z } from 'zod';

const TASK_CRITERIA_DESCRIPTION =
  'Per-task thresholds: each entry requires score >= minScore on that specific courseTaskId. ' +
  'Use this when tasks have different passing bars; it takes precedence over courseTaskIds/minScore.';
const COURSE_TASK_IDS_DESCRIPTION =
  'Shorthand for the case where every task shares one bar: each student must have score >= minScore ' +
  'on each of these tasks. Ignored when taskCriteria is provided.';

export const certificateCriteriaSchema = z
  .object({
    taskCriteria: z
      .array(
        z.object({
          courseTaskId: z.number().int().positive(),
          minScore: z.number().min(0).describe('Minimum score for this task.'),
        }),
      )
      .nonempty()
      .optional()
      .describe(TASK_CRITERIA_DESCRIPTION),
    courseTaskIds: z.array(z.number().int().positive()).optional().describe(COURSE_TASK_IDS_DESCRIPTION),
    minScore: z
      .number()
      .min(0)
      .optional()
      .describe('Per-task minimum score for courseTaskIds. Required when courseTaskIds is non-empty.'),
    minTotalScore: z.number().min(0).describe('Minimum total score across the course. Always required.'),
  })
  .refine(
    data => data.taskCriteria?.length || !data.courseTaskIds?.length || data.minScore !== undefined,
    'minScore is required when courseTaskIds is non-empty',
  );

export type CertificateCriteria = z.infer<typeof certificateCriteriaSchema>;

export const certificateCriteriaJsonSchemaProperties = {
  taskCriteria: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      properties: {
        courseTaskId: { type: 'integer', minimum: 1 },
        minScore: { type: 'number', minimum: 0, description: 'Minimum score for this task.' },
      },
      required: ['courseTaskId', 'minScore'],
      additionalProperties: false,
    },
    description: TASK_CRITERIA_DESCRIPTION,
  },
  courseTaskIds: {
    type: 'array',
    items: { type: 'integer', minimum: 1 },
    description: COURSE_TASK_IDS_DESCRIPTION,
  },
  minScore: {
    type: 'number',
    minimum: 0,
    description: 'Per-task minimum score for courseTaskIds. Required when courseTaskIds is non-empty.',
  },
  minTotalScore: {
    type: 'number',
    minimum: 0,
    description: 'Minimum total score across the course. Always required.',
  },
} as const;
