import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runRegisterToInterview } from './register-to-interview.js';

describe('register_to_interview', () => {
  it('posts the registration', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(await runRegisterToInterview(ctx, { courseId: 5, interviewId: 7 }));
    expect(calls).toEqual([{ method: 'POST', path: '/courses/5/interviews/7/register', body: undefined }]);
    expect(text).toBe('Registered for interview 7.');
  });

  it('surfaces API errors (registration not open)', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(400, 'Student registration is not available yet') });
    expect(toText(await runRegisterToInterview(ctx, { courseId: 5, interviewId: 7 }))).toContain('not available yet');
  });
});
