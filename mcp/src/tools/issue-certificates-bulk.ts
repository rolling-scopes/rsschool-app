import { z } from 'zod';
import { describeError, type RsappApiClient } from '../api-client.js';
import { certificateCriteriaJsonSchemaProperties, certificateCriteriaSchema } from './certificate-criteria.js';

export const issueCertificatesBulkInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  criteria: certificateCriteriaSchema,
});

export type IssueCertificatesBulkInput = z.infer<typeof issueCertificatesBulkInputSchema>;

export const ISSUE_CERTIFICATES_BULK_TOOL = {
  name: 'issue_certificates_bulk',
  description:
    'Issue certificates to all students matching the criteria. Triggers asynchronous PDF generation for every eligible student. Before calling, you should have called preview_eligible_students and received explicit user confirmation on the count and list.',
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

type BulkResult = {
  issued: number;
  students: { studentId: number; githubId: string; name: string }[];
};

const SUMMARY_DISPLAY_LIMIT = 20;

export async function runIssueCertificatesBulk(
  client: RsappApiClient,
  input: IssueCertificatesBulkInput,
): Promise<string> {
  const result = await client.post<BulkResult>(`/api/v2/certificate/course/${input.courseId}/bulk`, input.criteria);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  const { issued, students } = result.data;
  if (issued === 0) {
    return `No students matched the criteria. No certificates were issued.`;
  }
  const shown = students.slice(0, SUMMARY_DISPLAY_LIMIT);
  const lines = shown.map(s => `- ${s.name} (${s.githubId}) — studentId=${s.studentId}`);
  const suffix = issued > shown.length ? `\n…and ${issued - shown.length} more` : '';
  return (
    [`Issuance started for ${issued} student(s). PDFs will be available within minutes.`, ...lines].join('\n') + suffix
  );
}
