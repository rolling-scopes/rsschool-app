import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListTaskCatalog } from './list-task-catalog.js';

const tasks = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Task ${i + 1}`, type: 'jstask' }));

describe('list_task_catalog', () => {
  it('lists catalog tasks with their ids', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk(tasks(2)) });
    const text = toText(await runListTaskCatalog(ctx, {}));
    expect(calls).toEqual([{ method: 'GET', path: '/tasks' }]);
    expect(text).toContain('2 catalog task(s), showing 2');
    expect(text).toContain('id=1 | name=Task 1 | type=jstask');
  });

  it('filters by a case-insensitive name substring', async () => {
    const { ctx } = makeCtx({
      get: () =>
        apiOk([
          { id: 1, name: 'Kotlin basics' },
          { id: 2, name: 'JS basics' },
        ]),
    });
    const text = toText(await runListTaskCatalog(ctx, { search: 'kotlin' }));
    expect(text).toContain('Kotlin basics');
    expect(text).not.toContain('JS basics');
  });

  it('renders a task without a name or type', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 7 }]) });
    expect(toText(await runListTaskCatalog(ctx, {}))).toContain('id=7 | name=?');
  });

  it('truncates to the limit and hints how to narrow', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(tasks(80)) });
    const text = toText(await runListTaskCatalog(ctx, { limit: 10 }));
    expect(text).toContain('80 catalog task(s), showing 10');
    expect(text).toContain('…and 70 more');
  });

  it('reports no matches for a search', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(tasks(2)) });
    expect(toText(await runListTaskCatalog(ctx, { search: 'nothing' }))).toBe('No catalog tasks match "nothing".');
  });

  it('reports an empty catalog', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runListTaskCatalog(ctx, {}))).toBe('The task catalog is empty.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runListTaskCatalog(ctx, {}))).toContain('Permission denied');
  });

  it('skips entries without a name when searching', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 1 }, { id: 2, name: 'Named' }]) });
    const text = toText(await runListTaskCatalog(ctx, { search: 'named' }));
    expect(text).toContain('id=2');
    expect(text).not.toContain('id=1');
  });
});
