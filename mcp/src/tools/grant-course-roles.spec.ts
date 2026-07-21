import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGrantCourseRoles } from './grant-course-roles.js';

describe('grant_course_roles', () => {
  it('puts the full role set with omitted roles as false', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    const text = toText(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo', isManager: true }));
    expect(calls).toEqual([
      {
        method: 'PUT',
        path: '/courses/5/users/octo',
        body: { isManager: true, isSupervisor: false, isDementor: false, isActivist: false },
      },
    ]);
    expect(text).toContain('set to: manager');
  });

  it('reports an empty role set when all roles are explicitly false', async () => {
    const { ctx } = makeCtx({ put: () => apiOk({}) });
    expect(toText(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo', isManager: false }))).toContain(
      '(none)',
    );
  });

  it('defaults an unspecified role flag to false', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo', isSupervisor: true });
    expect(calls[0]?.body).toEqual({ isManager: false, isSupervisor: true, isDementor: false, isActivist: false });
  });

  it('forwards every provided role flag', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    await runGrantCourseRoles(ctx, {
      courseId: 5,
      githubId: 'octo',
      isManager: true,
      isSupervisor: true,
      isDementor: true,
      isActivist: true,
    });
    expect(calls[0]?.body).toEqual({ isManager: true, isSupervisor: true, isDementor: true, isActivist: true });
  });

  it('refuses a call that names no role flag (would revoke everything)', async () => {
    const { ctx, calls } = makeCtx({ put: () => apiOk({}) });
    expect(toText(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'octo' }))).toContain(
      'at least one role flag',
    );
    expect(calls).toEqual([]);
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ put: () => apiFail(400, 'User with githubid ghost is not found') });
    expect(toText(await runGrantCourseRoles(ctx, { courseId: 5, githubId: 'ghost', isManager: true }))).toContain(
      'is not found',
    );
  });
});
