import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetInterviewFeedback } from './get-interview-feedback.js';

describe('get_interview_feedback', () => {
  it('fetches the stage-interview feedback form', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ version: 1, json: {} }) });
    const text = await runGetInterviewFeedback(ctx, { courseId: 5, interviewId: 9 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/interviews/9/stage-interview/feedback' }]);
    expect(text).toContain('"version": 1');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(await runGetInterviewFeedback(ctx, { courseId: 5, interviewId: 9 })).toContain('Permission denied');
  });
});
