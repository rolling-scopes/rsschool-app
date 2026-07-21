import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetCourseInterviews } from './get-course-interviews.js';

describe('get_course_interviews', () => {
  it('lists interviews of a course', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ id: 1, name: 'Stage interview' }]) });
    const text = toText(await runGetCourseInterviews(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/interviews' }]);
    expect(text).toContain('Stage interview');
  });

  it('reports when there are no interviews', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runGetCourseInterviews(ctx, { courseId: 5 }))).toBe('Course 5 has no interviews.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runGetCourseInterviews(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
