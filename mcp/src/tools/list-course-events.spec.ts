import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runListCourseEvents } from './list-course-events.js';

describe('list_course_events', () => {
  it('lists events of a course', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ id: 1, event: { name: 'Lecture' } }]) });
    const text = await runListCourseEvents(ctx, { courseId: 5 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/events' }]);
    expect(text).toContain('Lecture');
  });

  it('reports empty events', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(await runListCourseEvents(ctx, { courseId: 5 })).toBe('Course 5 has no events.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(await runListCourseEvents(ctx, { courseId: 5 })).toContain('Authentication failed');
  });
});
