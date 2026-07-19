import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runExpelStudents } from './expel-students.js';

describe('expel_students', () => {
  it('posts criteria and options to the expel endpoint', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({ expelled: 4 }) });
    const text = await runExpelStudents(ctx, {
      courseId: 5,
      criteria: { minScore: 10, courseTaskIds: [1, 2] },
      keepWithMentor: true,
    });
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/students/expel',
        body: { criteria: { minScore: 10, courseTaskIds: [1, 2] }, options: { keepWithMentor: true } },
      },
    ]);
    expect(text).toContain('Expulsion completed.');
    expect(text).toContain('"expelled": 4');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(await runExpelStudents(ctx, { courseId: 5, criteria: {} })).toContain('Permission denied');
  });
});
