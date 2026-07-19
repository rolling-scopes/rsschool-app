import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runUpdateCourseTask } from './update-course-task.js';

describe('update_course_task', () => {
  it('puts only the provided fields', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    const text = await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11, maxScore: 200 });
    expect(calls).toEqual([{ method: 'PUT', path: '/courses/5/tasks/11', body: { maxScore: 200 } }]);
    expect(text).toContain('updated (maxScore)');
  });

  it('rejects an empty update without calling the API', async () => {
    const { ctx, calls } = makeCtx({});
    expect(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11 })).toContain('Nothing to update');
    expect(calls).toHaveLength(0);
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(403) });
    expect(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11, maxScore: 1 })).toContain(
      'Permission denied',
    );
  });
});
