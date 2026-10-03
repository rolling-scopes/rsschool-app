import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runApproveMentor } from './approve-mentor.js';

const MANAGER_OF_12_34 = {
  courses: [
    { courseId: 12, roles: ['manager' as const] },
    { courseId: 34, roles: ['supervisor' as const] },
  ],
};

describe('approve_mentor', () => {
  it('puts the approval for courses the caller manages or supervises', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}), user: MANAGER_OF_12_34 });
    const text = toText(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: ['12', '34'] }));
    expect(calls).toEqual([
      { method: 'PUT', path: '/registry/mentor/octo', body: { preselectedCourses: ['12', '34'] } },
    ]);
    expect(text).toContain('approved for courses: 12, 34');
  });

  it('rejects preselecting a course the caller does not manage or supervise', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}), user: MANAGER_OF_12_34 });
    expect(toText(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: ['12', '99'] }))).toContain(
      'Not allowed: 99',
    );
    expect(calls).toEqual([]);
  });

  it('lets an admin preselect any course', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}), user: { isAdmin: true } });
    await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: ['99'] });
    expect(calls).toEqual([{ method: 'PUT', path: '/registry/mentor/octo', body: { preselectedCourses: ['99'] } }]);
  });

  it('handles an empty course list', async () => {
    const { ctx } = makeCtx({ put: () => apiOk({}) });
    expect(toText(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: [] }))).toContain('(none)');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(403), user: { isAdmin: true } });
    expect(toText(await runApproveMentor(ctx, { githubId: 'octo', preselectedCourses: [] }))).toContain(
      'Permission denied',
    );
  });
});
