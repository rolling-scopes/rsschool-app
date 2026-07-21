import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toolError, type ToolContext, type ToolResult } from '../types.js';

export const submitTaskScoreInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  githubId: z.string().min(1).describe('GitHub login of the student being scored'),
  courseTaskId: z.number().int().positive().describe('Numeric ID of the course task (see list_course_tasks)'),
  score: z.number().describe('Score to assign'),
  comment: z.string().max(20000).optional().describe('Feedback comment for the student'),
  githubPrUrl: z.string().url().optional().describe('URL of the reviewed pull request, if any'),
});

export type SubmitTaskScoreInput = z.infer<typeof submitTaskScoreInputSchema>;

export const SUBMIT_TASK_SCORE_TOOL = {
  name: 'submit_task_score',
  description:
    "Submit a score (and optional feedback) for a student's task as the reviewing mentor / task owner. Confirm the student, task and score with the user before calling. Overwrites the previous score for this task if the author is the same.",
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      githubId: { type: 'string', minLength: 1, description: 'GitHub login of the student' },
      courseTaskId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course task' },
      score: { type: 'number', description: 'Score to assign' },
      comment: { type: 'string', description: 'Feedback comment for the student' },
      githubPrUrl: { type: 'string', format: 'uri', description: 'URL of the reviewed pull request' },
    },
    required: ['courseId', 'githubId', 'courseTaskId', 'score'],
    additionalProperties: false,
  },
} as const;

export async function runSubmitTaskScore(ctx: ToolContext, input: SubmitTaskScoreInput): Promise<ToolResult> {
  const result = await ctx.client.post<unknown>(
    `/course/${input.courseId}/students/score/${encodeURIComponent(input.githubId)}/task/${input.courseTaskId}`,
    { score: input.score, comment: input.comment, githubPrUrl: input.githubPrUrl },
  );
  if (!result.ok) {
    return toolError(describeError(result.status, result.message));
  }
  return `Score ${input.score} submitted for ${input.githubId}, course task ${input.courseTaskId}.`;
}
