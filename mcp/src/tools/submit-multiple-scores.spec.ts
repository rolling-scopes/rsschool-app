import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runSubmitMultipleScores } from './submit-multiple-scores.js';

describe('submit_multiple_scores', () => {
  it('posts the scores array and reports the per-student result', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk([{ status: 'ok', value: 'a' }]) });
    const scores = [{ studentGithubId: 'a', score: 10, comment: 'ok' }];
    const text = toText(await runSubmitMultipleScores(ctx, { courseId: 5, courseTaskId: 11, scores }));
    expect(calls).toEqual([{ method: 'POST', path: '/course/5/students/score/task/11/multiple', body: scores }]);
    expect(text).toContain('Submitted 1 score(s)');
    expect(text).toContain('"status": "ok"');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    const text = toText(
      await runSubmitMultipleScores(ctx, {
        courseId: 5,
        courseTaskId: 11,
        scores: [{ studentGithubId: 'a', score: 1 }],
      }),
    );
    expect(text).toContain('Permission denied');
  });
});
