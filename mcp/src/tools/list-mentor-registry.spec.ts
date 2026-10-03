import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runListMentorRegistry } from './list-mentor-registry.js';

describe('list_mentor_registry', () => {
  it('fetches applications with defaults', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ total: 0, mentors: [] }) });
    await runListMentorRegistry(ctx, {});
    expect(calls[0]?.path).toBe('/registry/mentors?status=all&currentPage=1&pageSize=20');
  });

  it('passes filters through', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({}) });
    await runListMentorRegistry(ctx, { status: 'new', page: 2, pageSize: 10, githubId: 'octo' });
    expect(calls[0]?.path).toBe('/registry/mentors?status=new&currentPage=2&pageSize=10&githubId=octo');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(403) });
    expect(toText(await runListMentorRegistry(ctx, {}))).toContain('Permission denied');
  });
});
