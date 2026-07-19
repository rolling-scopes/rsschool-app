import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runUpdateStudentStatus } from './update-student-status.js';

describe('update_student_status', () => {
  it('posts the new status with a comment', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = await runUpdateStudentStatus(ctx, {
      courseId: 5,
      githubId: 'stud',
      status: 'expelled',
      comment: 'no activity',
    });
    expect(calls).toEqual([
      { method: 'POST', path: '/courses/5/students/stud/status', body: { status: 'expelled', comment: 'no activity' } },
    ]);
    expect(text).toContain('changed to "expelled"');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    const text = await runUpdateStudentStatus(ctx, { courseId: 5, githubId: 'stud', status: 'active' });
    expect(text).toContain('Permission denied');
  });
});
