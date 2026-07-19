export type ApiClientConfig = {
  baseUrl: string;
  token: string;
  /**
   * Path prefix between the base URL and API paths. Public deployments sit
   * behind nginx which strips `/api/v2`, so the default is '/api/v2'; when
   * talking to the NestJS container directly (docker network, localhost) set
   * it to '' because NestJS serves routes without the prefix.
   */
  apiPrefix?: string;
};

export const DEFAULT_API_PREFIX = '/api/v2';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

export class RsappApiClient {
  constructor(private readonly config: ApiClientConfig) {}

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
    const prefix = this.config.apiPrefix ?? DEFAULT_API_PREFIX;
    const url = `${this.config.baseUrl.replace(/\/$/, '')}${prefix}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
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

const STATUS_HINTS: Record<number, string> = {
  401: 'Authentication failed. Check that RSAPP_PAT is valid and not revoked.',
  403: 'Permission denied. The PAT user lacks the required role for this action.',
  404: 'Resource not found.',
};

export function describeError(status: number, message: string): string {
  const hint = STATUS_HINTS[status];
  if (status === 0) return `Network error: ${message}`;
  if (hint) return `${hint} (HTTP ${status}). Detail: ${message}`;
  return `Request failed (HTTP ${status}): ${message}`;
}
