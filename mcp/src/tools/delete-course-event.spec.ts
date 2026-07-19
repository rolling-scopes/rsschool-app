import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runDeleteCourseEvent } from './delete-course-event.js';

describe('delete_course_event', () => {
  it('sends DELETE for the course event', async () => {
    const { ctx, calls } = makeCtx({ delete: () => apiOk({}) });
    const text = await runDeleteCourseEvent(ctx, { courseId: 5, courseEventId: 3 });
    expect(calls).toEqual([{ method: 'DELETE', path: '/courses/5/events/3' }]);
    expect(text).toBe('Course event 3 deleted from course 5.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ delete: () => apiFail(403) });
    expect(await runDeleteCourseEvent(ctx, { courseId: 5, courseEventId: 3 })).toContain('Permission denied');
  });
});
