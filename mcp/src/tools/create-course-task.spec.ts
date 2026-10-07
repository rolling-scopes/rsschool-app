import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runCreateCourseTask } from './create-course-task.js';

describe('create_course_task', () => {
  it('posts the task payload without courseId in the body', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(
      await runCreateCourseTask(ctx, {
        courseId: 5,
        taskId: 42,
        checker: 'crossCheck',
        studentStartDate: '2026-08-01',
        studentEndDate: '2026-08-15',
        maxScore: 100,
      }),
    );
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/tasks',
        body: {
          taskId: 42,
          checker: 'crossCheck',
          studentStartDate: '2026-08-01',
          studentEndDate: '2026-08-15',
          maxScore: 100,
        },
      },
    ]);
    expect(text).toContain('taskId=42');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    const text = toText(
      await runCreateCourseTask(ctx, {
        courseId: 5,
        taskId: 42,
        checker: 'mentor',
        studentStartDate: '2026-08-01',
        studentEndDate: '2026-08-15',
      }),
    );
    expect(text).toContain('Permission denied');
  });
});
