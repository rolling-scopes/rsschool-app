import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyMentorInterviews } from './get-my-mentor-interviews.js';

describe('get_my_mentor_interviews', () => {
  it('fetches mentor interviews via mentors/me', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ id: 3, student: 'stud1' }]) });
    const text = toText(await runGetMyMentorInterviews(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/interviews/mentors/me' }]);
    expect(text).toContain('stud1');
  });

  it('reports when there are no interviews', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runGetMyMentorInterviews(ctx, { courseId: 5 }))).toBe(
      'You have no interviews as an interviewer in this course.',
    );
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetMyMentorInterviews(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
