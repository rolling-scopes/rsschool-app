import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runSubmitTaskScore } from './submit-task-score.js';

describe('submit_task_score', () => {
  it('posts the score with feedback', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = await runSubmitTaskScore(ctx, {
      courseId: 5,
      githubId: 'stud',
      courseTaskId: 11,
      score: 95,
      comment: 'well done',
      githubPrUrl: 'https://github.com/x/pr/1',
    });
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/course/5/students/score/stud/task/11',
        body: { score: 95, comment: 'well done', githubPrUrl: 'https://github.com/x/pr/1' },
      },
    ]);
    expect(text).toContain('Score 95 submitted for stud');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    const text = await runSubmitTaskScore(ctx, { courseId: 5, githubId: 'stud', courseTaskId: 11, score: 1 });
    expect(text).toContain('Permission denied');
  });
});
