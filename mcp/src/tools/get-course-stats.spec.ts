import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetCourseStats } from './get-course-stats.js';

describe('get_course_stats', () => {
  it('fetches course stats', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ activeStudentsCount: 120 }) });
    const text = toText(await runGetCourseStats(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/stats' }]);
    expect(text).toContain('"activeStudentsCount": 120');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetCourseStats(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
