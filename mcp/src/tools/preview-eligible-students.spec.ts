import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runPreviewEligibleStudents } from './preview-eligible-students.js';

const criteria = { minTotalScore: 50 };

describe('preview_eligible_students', () => {
  it('posts criteria to the eligible endpoint and lists students', async () => {
    const { ctx, calls } = makeCtx({
      post: () => apiOk({ count: 1, students: [{ studentId: 3, githubId: 'a', name: 'A', totalScore: 77 }] }),
    });
    const text = await runPreviewEligibleStudents(ctx, { courseId: 5, criteria });
    expect(calls).toEqual([{ method: 'POST', path: '/certificate/course/5/eligible', body: criteria }]);
    expect(text).toContain('1 student(s) would receive a certificate');
    expect(text).toContain('totalScore=77');
  });

  it('reports empty preview', async () => {
    const { ctx } = makeCtx({ post: () => apiOk({ count: 0, students: [] }) });
    expect(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria })).toContain('No students match');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(401) });
    expect(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria })).toContain('Authentication failed');
  });
});
