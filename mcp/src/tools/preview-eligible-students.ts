import { z } from 'zod';
import { describeError, type RsappApiClient } from '../api-client.js';
import { certificateCriteriaJsonSchemaProperties, certificateCriteriaSchema } from './certificate-criteria.js';

export const previewEligibleStudentsInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  criteria: certificateCriteriaSchema,
});

export type PreviewEligibleStudentsInput = z.infer<typeof previewEligibleStudentsInputSchema>;

export const PREVIEW_ELIGIBLE_STUDENTS_TOOL = {
  name: 'preview_eligible_students',
  description:
    'Preview which students would receive a certificate given the criteria. ALWAYS call this before issue_certificates_bulk to show the list to the user and get their confirmation. Excludes already-certified, expelled, and failed students. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      criteria: {
        type: 'object',
        properties: certificateCriteriaJsonSchemaProperties,
        required: ['minTotalScore'],
      },
    },
    required: ['courseId', 'criteria'],
    additionalProperties: false,
  },
} as const;

type EligibleStudent = {
  studentId: number;
  githubId: string;
  name: string;
  totalScore: number;
};

type PreviewResult = {
  count: number;
  students: EligibleStudent[];
};

const PREVIEW_DISPLAY_LIMIT = 50;

export async function runPreviewEligibleStudents(
  client: RsappApiClient,
  input: PreviewEligibleStudentsInput,
): Promise<string> {
  const result = await client.post<PreviewResult>(
    `/api/v2/certificate/course/${input.courseId}/eligible`,
    input.criteria,
  );
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const { count, students } = result.data;
  if (count === 0) {
    return `No students match the criteria in course ${input.courseId}. Nothing would be issued.`;
  }
  const shown = students.slice(0, PREVIEW_DISPLAY_LIMIT);
  const lines = shown.map(s => `- ${s.name} (${s.githubId}) — studentId=${s.studentId}, totalScore=${s.totalScore}`);
  const suffix = count > shown.length ? `\n…and ${count - shown.length} more` : '';
  return [`${count} student(s) would receive a certificate:`, ...lines].join('\n') + suffix;
}
