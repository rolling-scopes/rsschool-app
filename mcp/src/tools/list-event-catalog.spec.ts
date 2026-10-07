import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListEventCatalog } from './list-event-catalog.js';

const events = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Event ${i + 1}`, type: 'lecture' }));

describe('list_event_catalog', () => {
  it('lists catalog events with their ids', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk(events(2)) });
    const text = toText(await runListEventCatalog(ctx, {}));
    expect(calls).toEqual([{ method: 'GET', path: '/events' }]);
    expect(text).toContain('2 catalog event(s), showing 2');
    expect(text).toContain('id=1 | name=Event 1 | type=lecture');
  });

  it('filters by a case-insensitive name substring', async () => {
    const { ctx } = makeCtx({
      get: () =>
        apiOk([
          { id: 1, name: 'Intro lecture' },
          { id: 2, name: 'Demo day' },
        ]),
    });
    const text = toText(await runListEventCatalog(ctx, { search: 'DEMO' }));
    expect(text).toContain('Demo day');
    expect(text).not.toContain('Intro lecture');
  });

  it('renders an event without a name or type', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 9 }]) });
    expect(toText(await runListEventCatalog(ctx, {}))).toContain('id=9 | name=?');
  });

  it('truncates to the limit and hints how to narrow', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(events(70)) });
    const text = toText(await runListEventCatalog(ctx, { limit: 5 }));
    expect(text).toContain('70 catalog event(s), showing 5');
    expect(text).toContain('…and 65 more');
  });

  it('reports no matches for a search', async () => {
    const { ctx } = makeCtx({ get: () => apiOk(events(2)) });
    expect(toText(await runListEventCatalog(ctx, { search: 'nothing' }))).toBe('No catalog events match "nothing".');
  });

  it('reports an empty catalog', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(toText(await runListEventCatalog(ctx, {}))).toBe('The event catalog is empty.');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runListEventCatalog(ctx, {}))).toContain('Permission denied');
  });

  it('skips entries without a name when searching', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 1 }, { id: 2, name: 'Named' }]) });
    const text = toText(await runListEventCatalog(ctx, { search: 'named' }));
    expect(text).toContain('id=2');
    expect(text).not.toContain('id=1');
  });
});
