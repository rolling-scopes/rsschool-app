import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runCreateCourseEvent } from './create-course-event.js';

describe('create_course_event', () => {
  it('posts the event payload without courseId in the body', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(
      await runCreateCourseEvent(ctx, {
        courseId: 5,
        eventId: 8,
        dateTime: '2026-08-01T10:00:00Z',
        place: 'Discord',
      }),
    );
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/events',
        body: { eventId: 8, dateTime: '2026-08-01T10:00:00Z', place: 'Discord' },
      },
    ]);
    expect(text).toContain('eventId=8');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(toText(await runCreateCourseEvent(ctx, { courseId: 5, eventId: 8 }))).toContain('Permission denied');
  });
});
