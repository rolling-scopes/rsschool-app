import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetCourseSchedule } from './get-course-schedule.js';

const FUTURE = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
const PAST = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

describe('get_course_schedule', () => {
  it('returns all schedule items', async () => {
    const { ctx, calls } = makeCtx({
      get: () =>
        apiOk([
          { name: 'Old task', endDate: PAST },
          { name: 'New task', endDate: FUTURE },
        ]),
    });
    const text = await runGetCourseSchedule(ctx, { courseId: 5 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/schedule' }]);
    expect(text).toContain('2 schedule item(s)');
  });

  it('filters to upcoming items only', async () => {
    const { ctx } = makeCtx({
      get: () =>
        apiOk([{ name: 'Old task', endDate: PAST }, { name: 'New task', endDate: FUTURE }, { name: 'No date' }]),
    });
    const text = await runGetCourseSchedule(ctx, { courseId: 5, upcomingOnly: true });
    expect(text).toContain('1 schedule item(s)');
    expect(text).toContain('New task');
    expect(text).not.toContain('Old task');
  });

  it('reports fully empty schedule', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(await runGetCourseSchedule(ctx, { courseId: 5 })).toBe('Course 5 has no schedule items.');
  });

  it('reports empty upcoming schedule', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ name: 'Old', endDate: PAST }]) });
    expect(await runGetCourseSchedule(ctx, { courseId: 5, upcomingOnly: true })).toBe(
      'Course 5 has no upcoming schedule items.',
    );
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(await runGetCourseSchedule(ctx, { courseId: 5 })).toContain('Permission denied');
  });
});
