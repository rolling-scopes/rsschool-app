import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyInterviewStudents } from './get-my-interview-students.js';

describe('get_my_interview_students', () => {
  it('fetches interview students of the PAT mentor', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ githubId: 'stud1' }]) });
    const text = toText(await runGetMyInterviewStudents(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/interviews/stage/interviewer/me/students' }]);
    expect(text).toContain('stud1');
  });

  it('reports when no students are assigned', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runGetMyInterviewStudents(ctx, { courseId: 5 }))).toBe(
      'No students are assigned to you for stage interviews.',
    );
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetMyInterviewStudents(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
