import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runSearchUsers } from './search-users.js';

describe('search_users', () => {
  it('searches by query', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([{ id: 1, githubId: 'octo', name: 'Octo Cat' }]) });
    const text = await runSearchUsers(ctx, { query: 'octo' });
    expect(calls).toEqual([{ method: 'GET', path: '/users/search?query=octo' }]);
    expect(text).toContain('octo — Octo Cat (id=1)');
  });

  it('passes includeSystem flag for an admin', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([]), user: { isAdmin: true } });
    await runSearchUsers(ctx, { query: 'bot', includeSystem: true });
    expect(calls[0]?.path).toBe('/users/search?query=bot&includeSystem=true');
  });

  it('rejects includeSystem for a non-admin without calling the API', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk([]) });
    expect(await runSearchUsers(ctx, { query: 'bot', includeSystem: true })).toContain('admin-only');
    expect(calls).toEqual([]);
  });

  it('renders users without a name', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([{ id: 2, githubId: 'anon' }]) });
    const text = await runSearchUsers(ctx, { query: 'anon' });
    expect(text).toContain('- anon (id=2)');
  });

  it('reports no matches', async () => {
    const { ctx } = makeCtx({ get: () => apiOk([]) });
    expect(await runSearchUsers(ctx, { query: 'nobody' })).toBe('No users matched "nobody".');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403, 'nope') });
    expect(await runSearchUsers(ctx, { query: 'x' })).toContain('Permission denied');
  });
});
