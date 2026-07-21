import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RsappApiClient, TIMEOUT_STATUS, describeError } from './api-client.js';

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
    fetchMock.mockResolvedValue(new Response(null, { status: 500, statusText: 'Server Error' }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 500, message: 'Server Error' });
  });

  it('keeps a non-JSON response body as text', async () => {
    fetchMock.mockResolvedValue(new Response('plain text', { status: 200 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: true, data: 'plain text' });
  });

  it('falls back to the raw text when an error response has no message field', async () => {
    fetchMock.mockResolvedValue(new Response('service down', { status: 500 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const result = await client.get('/session');
    expect(result).toEqual({ ok: false, status: 500, message: 'service down' });
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

  it('collapses 5xx bodies to a generic server-error message', () => {
    const described = describeError(500, 'stack trace: at Foo.bar (/app/x.js:1:1)');
    expect(described).toContain('server error (HTTP 500)');
    expect(described).not.toContain('stack trace');
    expect(describeError(503, 'anything')).toContain('server error (HTTP 503)');
  });

  it('falls back to a generic message for an un-hinted 4xx', () => {
    expect(describeError(418, 'boom')).toBe('Request failed (HTTP 418): boom');
  });
});

describe('RsappApiClient identity headers', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('identifies itself with a User-Agent', async () => {
    await new RsappApiClient({ baseUrl: 'https://x', token: 't' }).get('/session');
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers['User-Agent']).toMatch(/^rsschool-mcp\/\d+\.\d+\.\d+$/);
  });

  it('omits X-MCP-Tool until a tool is attached', async () => {
    await new RsappApiClient({ baseUrl: 'https://x', token: 't' }).get('/session');
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-MCP-Tool']).toBeUndefined();
  });

  it('sends X-MCP-Tool for a client tagged with withTool', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    await client.withTool('issue_certificate').get('/session');
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-MCP-Tool']).toBe('issue_certificate');
  });

  it('withTool returns a new client and leaves the original untagged', async () => {
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't' });
    const tagged = client.withTool('get_my_score');
    expect(tagged).not.toBe(client);
    await client.get('/session');
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-MCP-Tool']).toBeUndefined();
  });
});

describe('RsappApiClient timeout and retries', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('passes an abort signal built from the configured timeout', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    await new RsappApiClient({ baseUrl: 'https://x', token: 't', timeoutMs: 1234 }).get('/session');
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('reports a timeout distinctly from a network error', async () => {
    const timeout = new Error('The operation was aborted due to timeout');
    timeout.name = 'TimeoutError';
    fetchMock.mockRejectedValue(timeout);
    const result = await new RsappApiClient({ baseUrl: 'https://x', token: 't', timeoutMs: 50 }).get('/session');
    expect(result).toEqual({ ok: false, status: TIMEOUT_STATUS, message: 'No response within 50ms' });
    expect(describeError(TIMEOUT_STATUS, 'No response within 50ms')).toContain('did not respond in time');
  });

  it('does not retry a timeout', async () => {
    const timeout = new Error('aborted');
    timeout.name = 'AbortError';
    fetchMock.mockRejectedValue(timeout);
    await new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [0, 0] }).get('/session');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a GET on 503 and returns the eventual success', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [0, 0] });
    const result = await client.get('/session');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true, data: { ok: 1 } });
  });

  it('gives up after the configured number of retries', async () => {
    fetchMock.mockImplementation(async () => new Response('busy', { status: 504 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [0, 0] });
    const result = await client.get('/session');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(false);
  });

  it('does not retry a GET on a non-transient status', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 403 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [0, 0] });
    await client.get('/session');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never retries writes, even on a transient status', async () => {
    fetchMock.mockImplementation(async () => new Response('busy', { status: 503 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [0, 0] });
    await client.post('/certificate/course/5/bulk', {});
    await client.put('/x', {});
    await client.delete('/x');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('waits between retries when a delay is configured', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('busy', { status: 502 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const client = new RsappApiClient({ baseUrl: 'https://x', token: 't', retryDelaysMs: [5] });
    const startedAt = Date.now();
    await client.get('/session');
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(4);
  });
});
