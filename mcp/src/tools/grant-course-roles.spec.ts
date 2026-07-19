import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGrantCourseRoles } from './grant-course-roles.js';

describe('grant_course_roles', () => {
  it('puts the full role set with omitted roles as false', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    const text = await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo', isManager: true });
    expect(calls).toEqual([
      {
        method: 'PUT',
        path: '/courses/5/users/octo',
        body: { isManager: true, isSupervisor: false, isDementor: false, isActivist: false },
      },
    ]);
    expect(text).toContain('set to: manager');
  });

  it('reports an empty role set', async () => {
    const { ctx } = makeCtx({ put: () => apiOk({}) });
    expect(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo' })).toContain('(none)');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(400, 'User with githubid ghost is not found') });
    expect(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'ghost' })).toContain('is not found');
  });
});
