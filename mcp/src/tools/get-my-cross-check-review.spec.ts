import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, failureText, makeCtx, toText } from '../test-utils.js';
import { runGetMyCrossCheckReview } from './get-my-cross-check-review.js';

const input = { courseId: 5, courseTaskId: 11, studentGithubId: 'peer' };

describe('get_my_cross_check_review', () => {
  it('reads the review by the reviewed peer, not by the caller', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ score: 90, comment: 'solid' }) });
    const text = toText(await runGetMyCrossCheckReview(ctx, input));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/cross-checks/11/results/peer' }]);
    expect(text).toContain('"score": 90');
  });

  it('encodes the peer login in the path', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({}) });
    await runGetMyCrossCheckReview(ctx, { ...input, studentGithubId: 'we ird' });
    expect(calls[0]?.path).toBe('/courses/5/cross-checks/11/results/we%20ird');
  });

  it('reports that no review has been submitted yet', async () => {
    // getResult answers null until the caller actually submits a review.
    const { ctx } = makeCtx({ get: () => apiOk(null) });
    expect(toText(await runGetMyCrossCheckReview(ctx, input))).toBe(
      'You have not submitted a review for peer on task 11 yet.',
    );
  });

  it('explains a 400, which is how the backend signals "not your assignment"', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(400, 'no assigned cross-check') });
    const text = failureText(await runGetMyCrossCheckReview(ctx, input));
    expect(text).toContain('not assigned to check this solution');
    expect(text).toContain('"peer"');
  });

  it('surfaces other API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(failureText(await runGetMyCrossCheckReview(ctx, input))).toContain('Permission denied');
  });
});
