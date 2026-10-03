import { SERVER_NAME, SERVER_VERSION } from './version.js';

export type ApiClientConfig = {
  /**
   * Root of the RS School API, path included. Public deployments sit behind
   * nginx and need `https://app.rs.school/api/v2`; a NestJS instance addressed
   * directly (localhost, docker network) serves routes at its root.
   */
  baseUrl: string;
  token: string;
  /** Per-request timeout. A hung backend must not pin the MCP request forever. */
  timeoutMs?: number;
  /** Backoff delays for retried GETs. Overridden in tests to keep them fast. */
  retryDelaysMs?: number[];
  /**
   * Name of the MCP tool on whose behalf the call is made. Sent as `X-MCP-Tool`
   * so the backend audit log can attribute a request to a specific tool rather
   * than just "some PAT call". Set via `withTool()`, never by hand.
   */
  toolName?: string;
};

export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_RETRY_DELAYS_MS = [200, 600];

/** Transient upstream failures worth one more shot — but only for idempotent reads. */
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

/** Sentinel status for "the backend did not answer in time". */
export const TIMEOUT_STATUS = -1;

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

export class RsappApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  /**
   * Returns a client that tags its calls with the given tool name. Cheap:
   * shares the same config object, only the label differs.
   */
  public withTool(toolName: string): RsappApiClient {
    return new RsappApiClient({ ...this.config, toolName });
  }

  public get<T>(path: string): Promise<ApiResult<T>> {
    return this.request<T>('GET', path);
  }

  public post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, body);
  }

  public put<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, body);
  }

  public delete<T>(path: string): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> {
    let result = await this.attempt<T>(method, path, body);
    // Only GET is retried: replaying a POST/PUT could issue certificates or
    // scores twice, which is far worse than surfacing a transient error.
    if (method !== 'GET') {
      return result;
    }
    for (const delay of this.config.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS) {
      if (result.ok || !RETRYABLE_STATUSES.has(result.status)) {
        return result;
      }
      await sleep(delay);
      result = await this.attempt<T>(method, path, body);
    }
    return result;
  }

  private async attempt<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}${path}`;
    const timeoutMs = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `${SERVER_NAME}/${SERVER_VERSION}`,
    };
    if (this.config.toolName) {
      headers['X-MCP-Tool'] = this.config.toolName;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if (isTimeout(err)) {
        return { ok: false, status: TIMEOUT_STATUS, message: `No response within ${timeoutMs}ms` };
      }
      return { ok: false, status: 0, message: `Network error: ${(err as Error).message}` };
    }

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      const message =
        (parsed && typeof parsed === 'object' && 'message' in parsed
          ? String((parsed as { message: unknown }).message)
          : text) || response.statusText;
      return { ok: false, status: response.status, message };
    }

    return { ok: true, data: parsed as T };
  }
}

function isTimeout(err: unknown): boolean {
  return err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
}

function sleep(ms: number): Promise<void> {
  return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}

const STATUS_HINTS: Record<number, string> = {
  401: 'Authentication failed. Check that RSAPP_PAT is valid and not revoked.',
  403: 'Permission denied. The PAT user lacks the required role for this action.',
  404: 'Resource not found.',
};

export function describeError(status: number, message: string): string {
  if (status === TIMEOUT_STATUS) {
    return `The RS School API did not respond in time (${message}). It may be under load — try again shortly.`;
  }
  if (status === 0) return `Network error: ${message}`;
  // Don't surface backend 5xx bodies (stack traces / internal detail) to the
  // caller/model — collapse them to a generic message.
  if (status >= 500) return `The RS School API returned a server error (HTTP ${status}). Please retry later.`;
  const hint = STATUS_HINTS[status];
  if (hint) return `${hint} (HTTP ${status}). Detail: ${message}`;
  return `Request failed (HTTP ${status}): ${message}`;
}
