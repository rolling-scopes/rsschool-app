import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListCourseMentorsDetails } from './list-course-mentors-details.js';

const mentors = (n: number) => Array.from({ length: n }, (_, i) => ({ githubId: `m${i}` }));

describe('list_course_mentors_details', () => {
  it('fetches mentor details', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk(mentors(3)) });
    const text = toText(await runListCourseMentorsDetails(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/course/5/mentors/details' }]);
    expect(text).toContain('3 mentor(s), showing 3');
  });

  it('truncates to the limit', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(mentors(80)) });
    const text = toText(await runListCourseMentorsDetails(ctx, { courseId: 5, limit: 20 }));
    expect(text).toContain('80 mentor(s), showing 20');
    expect(text).toContain('…and 60 more');
  });

  it('reports empty result', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runListCourseMentorsDetails(ctx, { courseId: 5 }))).toBe('Course 5 has no mentors.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runListCourseMentorsDetails(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
