import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetCourseLeaderboard } from './get-course-leaderboard.js';

describe('get_course_leaderboard', () => {
  it('fetches the score with default pagination and activeOnly=true', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ content: [], pagination: {} }) });
    await runGetCourseLeaderboard(ctx, { courseId: 5 });
    expect(calls[0]?.path).toBe(
      '/course/5/students/score?activeOnly=true&orderBy=rank&orderDirection=asc&current=1&pageSize=20',
    );
  });

  it('passes explicit paging, activeOnly=false and githubId filter', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({}) });
    await runGetCourseLeaderboard(ctx, { courseId: 5, page: 2, pageSize: 50, activeOnly: false, githubId: 'octo' });
    expect(calls[0]?.path).toContain('activeOnly=false');
    expect(calls[0]?.path).toContain('current=2');
    expect(calls[0]?.path).toContain('pageSize=50');
    expect(calls[0]?.path).toContain('githubId=octo');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(await runGetCourseLeaderboard(ctx, { courseId: 5 })).toContain('Authentication failed');
  });
});
