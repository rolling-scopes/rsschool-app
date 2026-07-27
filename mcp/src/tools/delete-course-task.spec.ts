import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runDeleteCourseTask } from './delete-course-task.js';

describe('delete_course_task', () => {
  it('sends DELETE for the course task', async () => {
    const { ctx, calls } = makeCtx({ delete: () => apiOk({}) });
    const text = toText(await runDeleteCourseTask(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(calls).toEqual([{ method: 'DELETE', path: '/courses/5/tasks/11' }]);
    expect(text).toBe('Course task 11 deleted from course 5.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ delete: () => apiFail(403) });
    expect(toText(await runDeleteCourseTask(ctx, { courseId: 5, courseTaskId: 11 }))).toContain('Permission denied');
  });
});
