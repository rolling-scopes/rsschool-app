import { describe, expect, it } from 'vitest';
import { apiFail, apiOk, makeCtx } from '../test-utils.js';
import { runIssueCertificate } from './issue-certificate.js';

describe('issue_certificate', () => {
  it('posts to the certificate endpoint and reports success', async () => {
    const { ctx, calls } = makeCtx({
      post: () => apiOk({ studentId: 9, courseName: 'JS 2026', studentName: 'Octo Cat' }),
    });
    const text = await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'octo' });
    expect(calls).toEqual([{ method: 'POST', path: '/certificate/course/5/student/octo', body: undefined }]);
    expect(text).toContain('Octo Cat');
    expect(text).toContain('studentId=9');
  });

  it('encodes the github login in the path', async () => {
    const { ctx, calls } = makeCtx({ post: () => apiOk({ studentId: 1, courseName: 'c', studentName: 'n' }) });
    await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'we ird' });
    expect(calls[0]?.path).toBe('/certificate/course/5/student/we%20ird');
  });

  it('maps 404 to a student-not-found message', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(404) });
    expect(await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'ghost' })).toContain(
      'Student "ghost" not found in course 5',
    );
  });

  it('maps 403 to a permission message', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(403) });
    expect(await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'octo' })).toContain('Permission denied');
  });

  it('maps 401 to an authentication message', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(401) });
    expect(await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'octo' })).toContain('Authentication failed');
  });

  it('reports other statuses generically', async () => {
    const { ctx } = makeCtx({ post: () => apiFail(500, 'oops') });
    expect(await runIssueCertificate(ctx, { courseId: 5, studentGithubId: 'octo' })).toContain('HTTP 500');
  });
});
