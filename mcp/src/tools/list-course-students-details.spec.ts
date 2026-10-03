import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListCourseStudentsDetails } from './list-course-students-details.js';

const students = (n: number) => Array.from({ length: n }, (_, i) => ({ githubId: `u${i}` }));

describe('list_course_students_details', () => {
  it('fetches student details', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk(students(2)) });
    const text = toText(await runListCourseStudentsDetails(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/students/details' }]);
    expect(text).toContain('2 student(s), showing 2');
  });

  it('passes the active-only filter as a query param', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([]) });
    await runListCourseStudentsDetails(ctx, { courseId: 5, activeOnly: true });
    expect(calls[0]?.path).toBe('/courses/5/students/details?status=active');
  });

  it('lists active students below the default limit without a suffix', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(students(3)) });
    const text = toText(await runListCourseStudentsDetails(ctx, { courseId: 5, activeOnly: true }));
    expect(text).toContain('3 student(s), showing 3');
    expect(text).not.toContain('…and');
  });

  it('truncates to the limit', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(students(60)) });
    const text = toText(await runListCourseStudentsDetails(ctx, { courseId: 5, limit: 10 }));
    expect(text).toContain('60 student(s), showing 10');
    expect(text).toContain('…and 50 more');
  });

  it('reports empty result', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runListCourseStudentsDetails(ctx, { courseId: 5 }))).toBe('Course 5 has no matching students.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runListCourseStudentsDetails(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
