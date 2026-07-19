import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runUpdateCourseEvent } from './update-course-event.js';

describe('update_course_event', () => {
  it('puts only the provided fields', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    const text = await runUpdateCourseEvent(ctx, { courseId: 5, courseEventId: 3, place: 'YouTube' });
    expect(calls).toEqual([{ method: 'PUT', path: '/courses/5/events/3', body: { place: 'YouTube' } }]);
    expect(text).toContain('updated (place)');
  });

  it('rejects an empty update without calling the API', async () => {
    const { ctx, calls } = makeCtx({});
    expect(await runUpdateCourseEvent(ctx, { courseId: 5, courseEventId: 3 })).toContain('Nothing to update');
    expect(calls).toHaveLength(0);
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(403) });
    expect(await runUpdateCourseEvent(ctx, { courseId: 5, courseEventId: 3, place: 'x' })).toContain(
      'Permission denied',
    );
  });
});
