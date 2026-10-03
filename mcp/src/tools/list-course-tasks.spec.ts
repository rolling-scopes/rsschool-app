import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListCourseTasks } from './list-course-tasks.js';

describe('list_course_tasks', () => {
  it('lists tasks with ids and scores', async () => {
    const { ctx, calls } = makeCtx({
      get: () =>
        apiOk([
          { id: 11, name: 'Task A', maxScore: 100 },
          { id: 12, taskName: 'Task B' },
        ]),
    });
    const text = toText(await runListCourseTasks(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/courses/5/tasks' }]);
    expect(text).toContain('id=11');
    expect(text).toContain('maxScore=100');
    expect(text).toContain('Task B');
  });

  it('renders weight, type and falls back to "?" for a nameless task', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 13, scoreWeight: 0.5, type: 'jstask' }]) });
    const text = toText(await runListCourseTasks(ctx, { courseId: 5 }));
    expect(text).toContain('name=?');
    expect(text).toContain('weight=0.5');
    expect(text).toContain('type=jstask');
  });

  it('reports empty task list', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runListCourseTasks(ctx, { courseId: 5 }))).toBe('Course 5 has no tasks.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403, 'no access') });
    expect(toText(await runListCourseTasks(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
