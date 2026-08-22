import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runPreviewEligibleStudents } from './preview-eligible-students.js';

const criteria = { minTotalScore: 50 };

describe('preview_eligible_students', () => {
  it('posts criteria to the eligible endpoint and lists students', async () => {
    const { ctx, calls } = makeCtx({
      post: () => apiOk({ count: 1, students: [{ studentId: 3, githubId: 'a', name: 'A', totalScore: 77 }] }),
    });
    const text = toText(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria }));
    expect(calls).toEqual([{ method: 'POST', path: '/certificate/course/5/eligible', body: criteria }]);
    expect(text).toContain('1 student(s) would receive a certificate');
    expect(text).toContain('totalScore=77');
  });

  it('forwards per-task thresholds untouched', async () => {
    const taskCriteria = [
      { courseTaskId: 10, minScore: 50 },
      { courseTaskId: 20, minScore: 80 },
    ];
    const { ctx, calls } = makeCtx({ post: () => apiOk({ count: 0, students: [] }) });

    await runPreviewEligibleStudents(ctx, { courseId: 5, criteria: { minTotalScore: 50, taskCriteria } });

    expect(calls[0]?.body).toEqual({ minTotalScore: 50, taskCriteria });
  });

  it('truncates previews longer than the display limit', async () => {
    const students = Array.from({ length: 60 }, (_, i) => ({
      studentId: i,
      githubId: `u${i}`,
      name: `U${i}`,
      totalScore: i,
    }));
    const { ctx } = makeCtx({ post: () => apiOk({ count: 60, students }) });
    const text = toText(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria }));
    expect(text).toContain('60 student(s) would receive a certificate');
    expect(text).toContain('…and 10 more');
  });

  it('reports empty preview', async () => {
    const { ctx } = makeCtx({ post: () => apiOk({ count: 0, students: [] }) });
    expect(toText(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria }))).toContain('No students match');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(401) });
    expect(toText(await runPreviewEligibleStudents(ctx, { courseId: 5, criteria }))).toContain('Authentication failed');
  });
});
