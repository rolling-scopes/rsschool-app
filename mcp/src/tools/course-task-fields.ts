import { z } from 'zod';

/** Shared course-task payload fields for create/update tools. */
export const courseTaskFieldsSchema = {
  maxScore: z.number().optional().describe('Maximum score for the task'),
  scoreWeight: z.number().optional().describe('Weight of the task score in the total'),
  checker: z
    .enum(['auto-test', 'mentor', 'assigned', 'taskOwner', 'crossCheck', 'jury'])
    .optional()
    .describe('Who checks the task'),
  studentStartDate: z.string().max(64).optional().describe('ISO date when the task opens'),
  studentEndDate: z.string().max(64).optional().describe('ISO date of the deadline'),
  crossCheckEndDate: z.string().max(64).optional().describe('ISO date of the cross-check deadline'),
  taskOwnerId: z.number().int().optional().describe('User ID of the task owner'),
  pairsCount: z.number().int().optional().describe('Number of cross-check pairs'),
  type: z.string().max(200).optional().describe('Task type'),
  submitText: z.string().max(2000).optional().describe('Text shown on solution submit'),
};

export const courseTaskFieldsJsonSchemaProperties = {
  maxScore: { type: 'number', description: 'Maximum score for the task' },
  scoreWeight: { type: 'number', description: 'Weight of the task score in the total' },
  checker: {
    type: 'string',
    enum: ['auto-test', 'mentor', 'assigned', 'taskOwner', 'crossCheck', 'jury'],
    description: 'Who checks the task',
  },
  studentStartDate: { type: 'string', description: 'ISO date when the task opens' },
  studentEndDate: { type: 'string', description: 'ISO date of the deadline' },
  crossCheckEndDate: { type: 'string', description: 'ISO date of the cross-check deadline' },
  taskOwnerId: { type: 'integer', description: 'User ID of the task owner' },
  pairsCount: { type: 'integer', description: 'Number of cross-check pairs' },
  type: { type: 'string', description: 'Task type' },
  submitText: { type: 'string', description: 'Text shown on solution submit' },
} as const;
