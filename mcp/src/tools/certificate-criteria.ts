import { z } from 'zod';

export const certificateCriteriaSchema = z
  .object({
    courseTaskIds: z
      .array(z.number().int().positive())
      .optional()
      .describe(
        'Optional list of courseTaskIds. If present, each student must have score >= minScore on each of these tasks.',
      ),
    minScore: z
      .number()
      .min(0)
      .optional()
      .describe('Per-task minimum score. Required when courseTaskIds is non-empty.'),
    minTotalScore: z.number().min(0).describe('Minimum total score across the course. Always required.'),
  })
  .refine(
    data => !data.courseTaskIds?.length || data.minScore !== undefined,
    'minScore is required when courseTaskIds is non-empty',
  );

export type CertificateCriteria = z.infer<typeof certificateCriteriaSchema>;

export const certificateCriteriaJsonSchemaProperties = {
  courseTaskIds: {
    type: 'array',
    items: { type: 'integer', minimum: 1 },
    description:
      'Optional list of courseTaskIds. If present, each student must have score >= minScore on each of these tasks.',
  },
  minScore: {
    type: 'number',
    minimum: 0,
    description: 'Per-task minimum score. Required when courseTaskIds is non-empty.',
  },
  minTotalScore: {
    type: 'number',
    minimum: 0,
    description: 'Minimum total score across the course. Always required.',
  },
} as const;
