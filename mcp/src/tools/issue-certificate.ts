import { z } from 'zod';
import type { RsappApiClient } from '../api-client.js';

export const issueCertificateInputSchema = z.object({
  courseId: z.number().int().positive().describe('Numeric ID of the course'),
  studentGithubId: z.string().min(1).describe('GitHub login of the student whose certificate should be issued'),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateInputSchema>;

export const ISSUE_CERTIFICATE_TOOL = {
  name: 'issue_certificate',
  description:
    "Issue a course completion certificate to a student. The caller's PAT user must be a course manager (for the given course) or an admin. The call starts the asynchronous certificate generation pipeline; the PDF becomes available within seconds to minutes.",
  inputSchema: {
    type: 'object',
    properties: {
      courseId: { type: 'integer', minimum: 1, description: 'Numeric ID of the course' },
      studentGithubId: { type: 'string', minLength: 1, description: 'GitHub login of the student' },
    },
    required: ['courseId', 'studentGithubId'],
  },
} as const;

export async function runIssueCertificate(client: RsappApiClient, input: IssueCertificateInput): Promise<string> {
  const result = await client.post<{ studentId: number; courseName: string; studentName: string }>(
    `/api/v2/certificate/course/${input.courseId}/student/${encodeURIComponent(input.studentGithubId)}`,
  );

  if (!result.ok) {
    switch (result.status) {
      case 401:
        return `Authentication failed (401). Check that RSAPP_PAT is valid and not revoked. Detail: ${result.message}`;
      case 403:
        return `Permission denied (403). The PAT user must be course manager of course ${input.courseId} or an admin. Detail: ${result.message}`;
      case 404:
        return `Student "${input.studentGithubId}" not found in course ${input.courseId}.`;
      default:
        return `Certificate issuance failed (HTTP ${result.status}): ${result.message}`;
    }
  }

  const { studentName, courseName, studentId } = result.data;
  return `Certificate issuance started for ${studentName} (studentId=${studentId}) in "${courseName}". PDF will be available shortly.`;
}
