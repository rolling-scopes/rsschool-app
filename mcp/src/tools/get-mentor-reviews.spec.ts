import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMentorReviews } from './get-mentor-reviews.js';

describe('get_mentor_reviews', () => {
  it('fetches reviews with default pagination', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ content: [], pagination: { total: 0 } }) });
    await runGetMentorReviews(ctx, { courseId: 5 });
    expect(calls).toEqual([{ method: 'GET', path: '/course/5/mentor-reviews?current=1&pageSize=20' }]);
  });

  it('passes explicit pagination', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({}) });
    await runGetMentorReviews(ctx, { courseId: 5, page: 3, pageSize: 50 });
    expect(calls[0]?.path).toBe('/course/5/mentor-reviews?current=3&pageSize=50');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetMentorReviews(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
