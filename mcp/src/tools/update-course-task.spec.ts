import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runUpdateCourseTask } from './update-course-task.js';

describe('update_course_task', () => {
  it('carries over the current dates for a partial update', async () => {
    // The backend PUT requires studentStartDate/studentEndDate on every call,
    // so a partial update must fetch and re-send the existing dates.
    const { ctx, calls } = makeCtx({
      get: () => apiOk({ studentStartDate: '2020-01-01', studentEndDate: '2020-02-01' }),
      put: () => apiOk({}),
    });
    const text = toText(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11, maxScore: 200 }));
    expect(calls).toEqual([
      { method: 'GET', path: '/courses/5/tasks/11' },
      {
        method: 'PUT',
        path: '/courses/5/tasks/11',
        body: { maxScore: 200, studentStartDate: '2020-01-01', studentEndDate: '2020-02-01' },
      },
    ]);
    // Only the caller-provided field is reported, not the carried-over dates.
    expect(text).toContain('updated (maxScore)');
    expect(text).not.toContain('studentStartDate');
  });

  it('does not fetch when both dates are provided', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    await runUpdateCourseTask(ctx, {
      courseId: 5,
      courseTaskId: 11,
      maxScore: 200,
      studentStartDate: '2026-01-01',
      studentEndDate: '2026-02-01',
    });
    expect(calls).toEqual([
      {
        method: 'PUT',
        path: '/courses/5/tasks/11',
        body: { maxScore: 200, studentStartDate: '2026-01-01', studentEndDate: '2026-02-01' },
      },
    ]);
  });

  it('rejects an empty update without calling the API', async () => {
    const { ctx, calls } = makeCtx({});
    expect(toText(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11 }))).toContain('Nothing to update');
    expect(calls).toHaveLength(0);
  });

  it('surfaces an error from the current-task fetch', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiFail(404) });
    expect(toText(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11, maxScore: 1 }))).toContain(
      'not found',
    );
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/tasks/11' }]);
  });

  it('surfaces API errors from the update', async () => {
    const { ctx } = makeCtx({
      get: () => apiOk({ studentStartDate: 'a', studentEndDate: 'b' }),
      put: () => apiFail(403),
    });
    expect(toText(await runUpdateCourseTask(ctx, { courseId: 5, courseTaskId: 11, maxScore: 1 }))).toContain(
      'Permission denied',
    );
  });
});
