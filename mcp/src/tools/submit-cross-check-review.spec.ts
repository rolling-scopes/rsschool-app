import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runSubmitCrossCheckReview } from './submit-cross-check-review.js';

describe('submit_cross_check_review', () => {
  it('posts the review with anonymous defaulting to false', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(
      await runSubmitCrossCheckReview(ctx, {
        courseId: 5,
        courseTaskId: 11,
        studentGithubId: 'peer',
        score: 88,
        comment: 'good job',
      }),
    );
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/cross-checks/11/results/peer',
        body: { score: 88, comment: 'good job', anonymous: false },
      },
    ]);
    expect(text).toContain('score 88');
  });

  it('passes anonymous=true through', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    await runSubmitCrossCheckReview(ctx, {
      courseId: 5,
      courseTaskId: 11,
      studentGithubId: 'peer',
      score: 1,
      comment: 'x',
      anonymous: true,
    });
    expect((calls[0]?.body as { anonymous: boolean }).anonymous).toBe(true);
  });

  it('surfaces API errors (e.g. not your assignment)', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(400, 'no assigned cross-check') });
    const text = toText(
      await runSubmitCrossCheckReview(ctx, {
        courseId: 5,
        courseTaskId: 11,
        studentGithubId: 'peer',
        score: 1,
        comment: 'x',
      }),
    );
    expect(text).toContain('no assigned cross-check');
  });
});
