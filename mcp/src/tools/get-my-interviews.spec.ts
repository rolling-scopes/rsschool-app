import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runGetMyInterviews } from './get-my-interviews.js';

describe('get_my_interviews', () => {
  it('fetches student interviews via students/me', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ id: 1, interviewer: 'mentor1' }]) });
    const text = await runGetMyInterviews(ctx, { courseId: 5 });
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/interviews/students/me' }]);
    expect(text).toContain('mentor1');
  });

  it('reports when there are no interviews', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(await runGetMyInterviews(ctx, { courseId: 5 })).toBe('You have no interviews in this course.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(await runGetMyInterviews(ctx, { courseId: 5 })).toContain('Authentication failed');
  });
});
