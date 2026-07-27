import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx, toText } from '../test-utils.js';
import { runDistributeInterviewPairs } from './distribute-interview-pairs.js';

describe('distribute_interview_pairs', () => {
  it('posts with defaults clean=false, registrationEnabled=true', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk([{ pair: 1 }, { pair: 2 }]) });
    const text = toText(await runDistributeInterviewPairs(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/courses/5/interviews/11/auto-distribute',
        body: { clean: false, registrationEnabled: true },
      },
    ]);
    expect(text).toContain('Created 2 interview pair(s)');
  });

  it('passes explicit options', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk([]) });
    await runDistributeInterviewPairs(ctx, { courseId: 5, courseTaskId: 11, clean: true, registrationEnabled: false });
    expect(calls[0]?.body).toEqual({ clean: true, registrationEnabled: false });
  });

  it('handles a non-array response defensively', async () => {
    const { ctx } = makeCtx({ post: () => apiOk({ unexpected: true }) });
    const text = toText(await runDistributeInterviewPairs(ctx, { courseId: 5, courseTaskId: 11 }));
    expect(text).toContain('Created 0 interview pair(s)');
  });

  it('surfaces API errors', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(400, 'No interview pairs were created') });
    expect(toText(await runDistributeInterviewPairs(ctx, { courseId: 5, courseTaskId: 11 }))).toContain(
      'No interview pairs were created',
    );
  });
});
