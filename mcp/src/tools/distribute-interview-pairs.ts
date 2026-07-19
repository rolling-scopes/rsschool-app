import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const distributeInterviewPairsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the interview course task'),
  clean: z.boolean().optional().describe('Remove existing pairs before distributing'),
  registrationEnabled: z.boolean().optional().describe('Only include students registered for the interview'),
});

export type DistributeInterviewPairsInput = z.infer<typeof distributeInterviewPairsInputSchema>;

export const DISTRIBUTE_INTERVIEW_PAIRS_TOOL = {
  name: 'distribute_interview_pairs',
  description:
    'Automatically distribute interview pairs for a regular (non-stage) interview task. Confirm the options with the user before calling — with clean=true existing pairs are removed first.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the interview course task' },
      clean: { type: 'boolean', description: 'Remove existing pairs before distributing' },
      registrationEnabled: { type: 'boolean', description: 'Only include students registered for the interview' },
    },
    required: ['courseId', 'courseTaskId'],
    additionalProperties: false,
  },
} as const;

export async function runDistributeInterviewPairs(
  ctx: ToolContext,
  input: DistributeInterviewPairsInput,
): Promise<string> {
  const result = await ctx.client.post<unknown[]>(
    `/courses/${input.courseId}/interviews/${input.courseTaskId}/auto-distribute`,
    { clean: input.clean ?? false, registrationEnabled: input.registrationEnabled ?? true },
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const count = Array.isArray(result.data) ? result.data.length : 0;
  return [`Created ${count} interview pair(s).`, toJsonBlock(result.data)].join('\n');
}
