export type ApiClientConfig = {
  baseUrl: string;
  token: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

export class RsappApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  public async post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
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
