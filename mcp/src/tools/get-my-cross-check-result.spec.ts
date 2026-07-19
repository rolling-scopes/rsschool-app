import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetMyCrossCheckResult } from './get-my-cross-check-result.js';

describe('get_my_cross_check_result', () => {
  it('fetches the result using the session github id', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ score: 90, comments: ['nice'] }) });
    const text = await runGetMyCrossCheckResult(ctx, { courseId: 5, courseTaskId: 11 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/cross-checks/11/results/octo' }]);
    expect(text).toContain('"score": 90');
  });

  it('maps 404 to a not-reviewed-yet message', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(404) });
    expect(await runGetMyCrossCheckResult(ctx, { courseId: 5, courseTaskId: 11 })).toContain(
      'No cross-check result found for task 11',
    );
  });

  it('surfaces other API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(await runGetMyCrossCheckResult(ctx, { courseId: 5, courseTaskId: 11 })).toContain('Authentication failed');
  });
});
