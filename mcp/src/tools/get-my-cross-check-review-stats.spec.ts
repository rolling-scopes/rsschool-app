import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetMyCrossCheckReviewStats } from './get-my-cross-check-review-stats.js';

describe('get_my_cross_check_review_stats', () => {
  it('fetches available review stats', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ name: 'Task A', total: 4, completed: 1 }]) });
    const text = await runGetMyCrossCheckReviewStats(ctx, { courseId: 5 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/cross-checks/available-review-stats' }]);
    expect(text).toContain('"Task A"');
  });

  it('reports when there are no open cross-checks', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(await runGetMyCrossCheckReviewStats(ctx, { courseId: 5 })).toBe('No open cross-check tasks right now.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(await runGetMyCrossCheckReviewStats(ctx, { courseId: 5 })).toContain('Permission denied');
  });
});
