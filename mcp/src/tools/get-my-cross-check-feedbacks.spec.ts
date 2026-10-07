import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyCrossCheckFeedbacks } from './get-my-cross-check-feedbacks.js';

describe('get_my_cross_check_feedbacks', () => {
  it('fetches feedbacks for own solution', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ reviews: [{ comment: 'nice' }] }) });
    const text = toText(await runGetMyCrossCheckFeedbacks(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/cross-checks/11/feedbacks/my' }]);
    expect(text).toContain('nice');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetMyCrossCheckFeedbacks(ctx, { courseId: 5, courseTaskId: 11 }))).toContain(
      'Permission denied',
    );
  });
});
