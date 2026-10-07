import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyCrossCheckAssignments } from './get-my-cross-check-assignments.js';

describe('get_my_cross_check_assignments', () => {
  it('fetches assignments via the "me" alias', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ githubId: 'peer', url: 'https://x.dev' }]) });
    const text = toText(await runGetMyCrossCheckAssignments(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/cross-checks/11/assignments/me' }]);
    expect(text).toContain('peer');
  });

  it('reports when there are no assignments', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runGetMyCrossCheckAssignments(ctx, { courseId: 5, courseTaskId: 11 }))).toBe(
      'No cross-check assignments for this task.',
    );
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetMyCrossCheckAssignments(ctx, { courseId: 5, courseTaskId: 11 }))).toContain(
      'Permission denied',
    );
  });
});
