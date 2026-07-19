import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetStudentSummary } from './get-student-summary.js';

describe('get_student_summary', () => {
  it('fetches the summary for a student', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ totalScore: 100, isActive: true }) });
    const text = await runGetStudentSummary(ctx, { courseId: 5, githubId: 'stud' });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/students/stud/summary' }]);
    expect(text).toContain('"totalScore": 100');
  });

  it('maps 404 to a not-found message', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(404) });
    expect(await runGetStudentSummary(ctx, { courseId: 5, githubId: 'ghost' })).toContain(
      'Student "ghost" not found in course 5',
    );
  });

  it('surfaces other API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(await runGetStudentSummary(ctx, { courseId: 5, githubId: 'stud' })).toContain('Permission denied');
  });
});
