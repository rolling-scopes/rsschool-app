import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runCompleteCrossCheck } from './complete-cross-check.js';

describe('complete_cross_check', () => {
  it('posts to the completion endpoint', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = await runCompleteCrossCheck(ctx, { courseId: 5, courseTaskId: 11 });
    expect(calls).toEqual([{ method: 'POST', path: '/courses/5/cross-checks/11/completion', body: undefined }]);
    expect(text).toContain('completion started');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(await runCompleteCrossCheck(ctx, { courseId: 5, courseTaskId: 11 })).toContain('Permission denied');
  });
});
