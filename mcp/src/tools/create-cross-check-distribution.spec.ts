import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runCreateCrossCheckDistribution } from './create-cross-check-distribution.js';

describe('create_cross_check_distribution', () => {
  it('posts to the distribution endpoint', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(await runCreateCrossCheckDistribution(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(calls).toEqual([{ method: 'POST', path: '/courses/5/cross-checks/11/distribution', body: undefined }]);
    expect(text).toContain('distribution started');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(toText(await runCreateCrossCheckDistribution(ctx, { courseId: 5, courseTaskId: 11 }))).toContain(
      'Permission denied',
    );
  });
});
