import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runApproveMentor } from './approve-mentor.js';

describe('approve_mentor', () => {
  it('puts the approval with preselected courses', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    const text = await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: ['12', '34'] });
    expect(calls).toEqual([
      { method: 'PUT', path: '/registry/mentor/octo', body: { preselectedCourses: ['12', '34'] } },
    ]);
    expect(text).toContain('approved for courses: 12, 34');
  });

  it('handles an empty course list', async () => {
    const { ctx } = makeCtx({ put: () => apiOk({}) });
    expect(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: [] })).toContain('(none)');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(403) });
    expect(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: [] })).toContain('Permission denied');
  });
});
