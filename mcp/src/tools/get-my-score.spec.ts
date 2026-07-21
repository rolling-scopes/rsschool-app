import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runGetMyScore } from './get-my-score.js';

describe('get_my_score', () => {
  it('fetches the score using the session github id', async () => {
    const { ctx, calls } = makeCtx({ get: () => apiOk({ totalScore: 420, rank: 7 }) });
    const text = toText(await runGetMyScore(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'GET', path: '/course/5/students/score/octo' }]);
    expect(text).toContain('"totalScore": 420');
  });

  it('maps 404 to a not-a-student message', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(404) });
    expect(toText(await runGetMyScore(ctx, { courseId: 5 }))).toContain('not a student of course 5');
  });

  it('surfaces other API errors', async () => {
    const { ctx } = makeCtx({ get: () => apiFail(401) });
    expect(toText(await runGetMyScore(ctx, { courseId: 5 }))).toContain('Authentication failed');
  });
});
