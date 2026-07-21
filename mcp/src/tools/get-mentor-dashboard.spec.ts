import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMentorDashboard } from './get-mentor-dashboard.js';

const MENTOR_USER = { courses: [{ courseId: 5, roles: ['mentor' as const], mentorId: 77 }] };

describe('get_mentor_dashboard', () => {
  it('fetches the dashboard for the session mentor', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ taskName: 'Task A', studentName: 'S' }]), user: MENTOR_USER });
    const text = toText(await runGetMentorDashboard(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/mentors/77/course/5/dashboard' }]);
    expect(text).toContain('Task A');
  });

  it('reports an empty dashboard', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]), user: MENTOR_USER });
    expect(toText(await runGetMentorDashboard(ctx, { courseId: 5 }))).toContain('dashboard is empty');
  });

  it('rejects when the user is not a mentor of the course', async () => {
    const { ctx } = makeCtx({ user: MENTOR_USER });
    expect(toText(await runGetMentorDashboard(ctx, { courseId: 9 }))).toBe('You are not a mentor of course 9.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(400, 'oops'), user: MENTOR_USER });
    expect(toText(await runGetMentorDashboard(ctx, { courseId: 5 }))).toContain('oops');
  });
});
