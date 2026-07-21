import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyProfile } from './get-my-profile.js';

describe('get_my_profile', () => {
  it('fetches the profile and renders JSON', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ name: 'Octo Cat', githubId: 'octo' }) });
    const text = toText(await runGetMyProfile(ctx, {}));
    expect(calls).toEqual([{ method: 'GET', path: '/profile/me' }]);
    expect(text).toContain('"name": "Octo Cat"');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(toText(await runGetMyProfile(ctx, {}))).toContain('Authentication failed');
  });
});
