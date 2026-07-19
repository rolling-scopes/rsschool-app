import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runIssueCertificatesBulk } from './issue-certificates-bulk.js';

const criteria = { minTotalScore: 100 };

describe('issue_certificates_bulk', () => {
  it('posts criteria and summarizes issued certificates', async () => {
    const { ctx, calls } = makeCtx({
      post: () =>
        apiOk({
          issued: 2,
          students: [
            { studentId: 1, githubId: 'a', name: 'A' },
            { studentId: 2, githubId: 'b', name: 'B' },
          ],
        }),
    });
    const text = await runIssueCertificatesBulk(ctx, { courseId: 5, criteria });
    expect(calls).toEqual([{ method: 'POST', path: '/certificate/course/5/bulk', body: criteria }]);
    expect(text).toContain('Issuance started for 2 student(s)');
    expect(text).toContain('- A (a) — studentId=1');
  });

  it('truncates long student lists', async () => {
    const students = Array.from({ length: 25 }, (_, i) => ({ studentId: i, githubId: `u${i}`, name: `U${i}` }));
    const { ctx } = makeCtx({ post: () => apiOk({ issued: 25, students }) });
    const text = await runIssueCertificatesBulk(ctx, { courseId: 5, criteria });
    expect(text).toContain('…and 5 more');
  });

  it('reports when nothing matched', async () => {
    const { ctx } = makeCtx({ post: () => apiOk({ issued: 0, students: [] }) });
    expect(await runIssueCertificatesBulk(ctx, { courseId: 5, criteria })).toContain('No students matched');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(await runIssueCertificatesBulk(ctx, { courseId: 5, criteria })).toContain('Permission denied');
  });
});
