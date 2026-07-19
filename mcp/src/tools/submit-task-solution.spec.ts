import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runSubmitTaskSolution } from './submit-task-solution.js';

describe('submit_task_solution', () => {
  it('posts the solution url', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = await runSubmitTaskSolution(ctx, {
      courseId: 5,
      courseTaskId: 11,
      url: 'https://github.com/octo/task',
    });
    expect(calls).toEqual([
      { method: 'POST', path: '/courses/5/tasks/11/solutions', body: { url: 'https://github.com/octo/task' } },
    ]);
    expect(text).toContain('Solution submitted');
  });

  it('surfaces API errors (e.g. deadline passed)', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(400, 'deadline passed') });
    const text = await runSubmitTaskSolution(ctx, { courseId: 5, courseTaskId: 11, url: 'https://x.dev' });
    expect(text).toContain('deadline passed');
  });
});
