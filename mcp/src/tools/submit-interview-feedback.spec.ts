import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runSubmitInterviewFeedback } from './submit-interview-feedback.js';

describe('submit_interview_feedback', () => {
  it('posts the feedback payload', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = await runSubmitInterviewFeedback(ctx, {
      courseId: 5,
      interviewId: 9,
      version: 1,
      json: { q1: 'a1' },
      decision: 'yes',
      isGoodCandidate: true,
      isCompleted: true,
    });
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/interviews/9/stage-interview/feedback',
        body: { version: 1, json: { q1: 'a1' }, decision: 'yes', isGoodCandidate: true, isCompleted: true },
      },
    ]);
    expect(text).toContain('saved for interview 9');
  });

  it('surfaces API errors (not a mentor)', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403, 'You are not a mentor of course 5') });
    const text = await runSubmitInterviewFeedback(ctx, { courseId: 5, interviewId: 9, version: 0, json: {} });
    expect(text).toContain('Permission denied');
  });
});
