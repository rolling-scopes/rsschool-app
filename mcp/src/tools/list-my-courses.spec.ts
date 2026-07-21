import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListMyCourses } from './list-my-courses.js';

const COURSES = [
  { id: 1, name: 'JS 2026', alias: 'js-2026', completed: false },
  { id: 2, name: 'Node 2026', completed: true },
  { id: 3, name: 'React 2026', completed: false },
];

describe('list_my_courses', () => {
  it('lists all courses for admin', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk(COURSES), user: { isAdmin: true } });
    const text = toText(await runListMyCourses(ctx, {}));
    expect(calls).toEqual([{ method: 'GET', path: '/courses' }]);
    expect(text).toContain('admin with access to all 3');
    expect(text).toContain('JS 2026');
  });

  it('lists only membership courses with roles for a regular user', async () => {
    const { ctx } = makeCtx({
      get: () => apiOk(COURSES),
      user: {
        courses: [
          { courseId: 1, roles: ['student'], studentId: 5, isExpelled: true },
          { courseId: 3, roles: ['mentor'], mentorId: 7 },
        ],
      },
    });
    const text = toText(await runListMyCourses(ctx, {}));
    expect(text).toContain('2 course(s)');
    expect(text).toContain('roles=student(expelled)');
    expect(text).toContain('roles=mentor');
    expect(text).not.toContain('Node 2026');
  });

  it('renders discipline and dates when present', async () => {
    const { ctx } = makeCtx({
      get: () =>
        apiOk([
          {
            id: 1,
            name: 'JS 2026',
            alias: 'js-2026',
            discipline: { name: 'JavaScript' },
            startDate: '2026-01-01T00:00:00Z',
            endDate: '2026-06-01T00:00:00Z',
            completed: false,
          },
        ]),
      user: { isAdmin: true },
    });
    const text = toText(await runListMyCourses(ctx, {}));
    expect(text).toContain('discipline=JavaScript');
    expect(text).toContain('start=2026-01-01');
    expect(text).toContain('end=2026-06-01');
  });

  it('reports when the user has no courses', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(COURSES) });
    expect(toText(await runListMyCourses(ctx, {}))).toBe('You are not a member of any course.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401, 'bad token') });
    expect(toText(await runListMyCourses(ctx, {}))).toContain('Authentication failed');
  });
});
