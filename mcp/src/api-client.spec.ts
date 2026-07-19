import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RsappApiClient, describeError } from './api-client.js';

describe('RsappApiClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('prepends the default /api/v2 prefix', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://app.rs.school', token: 't' });
    await client.get('/session');
    expect(fetchMock).toHaveBeenCalledWith('https://app.rs.school/api/v2/session', expect.anything());
  });

  it('honors an empty prefix for direct NestJS access', async () => {
    const client = new RsappApiClient({ baseUrl: 'http://nestjs:8080', token: 't', apiPrefix: '' });
    await client.get('/session');
    expect(fetchMock).toHaveBeenCalledWith('http://nestjs:8080/session', expect.anything());
  });

  it('strips a trailing slash from the base URL', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://app.rs.school/', token: 't' });
    await client.get('/session');
    expect(fetchMock).toHaveBeenCalledWith('https://app.rs.school/api/v2/session', expect.anything());
  });

  it('sends the PAT as a Bearer header', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 'rsapp_pat_abc' });
    await client.get('/session');
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer rsapp_pat_abc');
  });

  it('sends POST with a JSON body', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    await client.post('/certificate/course/5/bulk', { minTotalScore: 1 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ minTotalScore: 1 }));
  });

  it('sends PUT with a JSON body', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    await client.put('/registry/mentor/octo', { preselectedCourses: [] });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://x/api/v2/registry/mentor/octo');
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(JSON.stringify({ preselectedCourses: [] }));
  });

  it('sends DELETE without a body', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    await client.delete('/courses/5/tasks/1');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://x/api/v2/courses/5/tasks/1');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });

  it('returns undefined data for an empty response body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('falls back to statusText when an error response has an empty body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502, statusText: 'Bad Gateway' }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 502, message: 'Bad Gateway' });
  });

  it('keeps a non-JSON response body as text', async () => {
    fetchMock.mockResolvedValue(new Response('plain text', { status: 200 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: true, data: 'plain text' });
  });

  it('falls back to the raw text when an error response has no message field', async () => {
    fetchMock.mockResolvedValue(new Response('service down', { status: 502 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 502, message: 'service down' });
  });

  it('returns a failed result with the backend message', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'denied' }), { status: 403 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 403, message: 'denied' });
  });

  it('returns status 0 on network errors', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 0, message: 'Network error: ECONNREFUSED' });
  });
});

describe('describeError', () => {
  it('maps known statuses to hints', () => {
    expect(describeError(401, 'x')).toContain('Authentication failed');
    expect(describeError(403, 'x')).toContain('Permission denied');
    expect(describeError(404, 'x')).toContain('Resource not found');
  });

  it('describes network errors (status 0)', () => {
    expect(describeError(0, 'ECONNREFUSED')).toBe('Network error: ECONNREFUSED');
  });

  it('falls back to a generic message', () => {
    expect(describeError(500, 'boom')).toBe('Request failed (HTTP 500): boom');
  });
});
