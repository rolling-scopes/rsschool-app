import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListMyStudents } from './list-my-students.js';

const MENTOR_USER = { courses: [{ courseId: 5, roles: ['mentor' as const], mentorId: 77 }] };

describe('list_my_students', () => {
  it('uses the mentorId from the session', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ githubId: 'stud1' }]), user: MENTOR_USER });
    const text = toText(await runListMyStudents(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/mentors/77/students' }]);
    expect(text).toContain('stud1');
  });

  it('rejects when the user is not a mentor of the course', async () => {
    const { ctx, calls } = makeCtx({ user: MENTOR_USER });
    expect(toText(await runListMyStudents(ctx, { courseId: 6 }))).toBe('You are not a mentor of course 6.');
    expect(calls).toHaveLength(0);
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403), user: MENTOR_USER });
    expect(toText(await runListMyStudents(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
