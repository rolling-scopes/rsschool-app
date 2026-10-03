import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runCreateStageInterviews } from './create-stage-interviews.js';

describe('create_stage_interviews', () => {
  it('posts with noRegistration defaulting to false', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    const text = toText(await runCreateStageInterviews(ctx, { courseId: 5 }));
    expect(calls).toEqual([{ method: 'POST', path: '/courses/5/interviews/stage', body: { noRegistration: false } }]);
    expect(text).toContain('pairs created');
  });

  it('passes noRegistration=true through', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({}) });
    await runCreateStageInterviews(ctx, { courseId: 5, noRegistration: true });
    expect((calls[0]?.body as { noRegistration: boolean }).noRegistration).toBe(true);
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(toText(await runCreateStageInterviews(ctx, { courseId: 5 }))).toContain('Permission denied');
  });
});
