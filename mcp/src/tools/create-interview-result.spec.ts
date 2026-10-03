import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runCreateInterviewResult } from './create-interview-result.js';

describe('create_interview_result', () => {
  it('posts the interview result', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(
      await runCreateInterviewResult(ctx, {
        courseId: 5,
        courseTaskId: 11,
        studentGithubId: 'stud',
        score: 4,
        comment: 'solid',
      }),
    );
    expect(calls).toEqual([
      { method: 'POST', path: '/courses/5/interviews/11/students/stud/result', body: { score: 4, comment: 'solid' } },
    ]);
    expect(text).toContain('score 4');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(400, 'no interview pair') });
    const text = toText(
      await runCreateInterviewResult(ctx, {
        courseId: 5,
        courseTaskId: 11,
        studentGithubId: 'stud',
        score: 4,
      }),
    );
    expect(text).toContain('no interview pair');
  });
});
