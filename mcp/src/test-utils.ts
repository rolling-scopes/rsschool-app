import type { ApiResult, RsappApiClient } from './api-client.js';
import type { ResolvedUser, ToolContext } from './types.js';

export type RecordedCall = { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; body?: unknown };

type MakeCtxOptions = {
  get?: (path: string) => ApiResult<unknown>;
  post?: (path: string, body?: unknown) => ApiResult<unknown>;
  put?: (path: string, body?: unknown) => ApiResult<unknown>;
  delete?: (path: string) => ApiResult<unknown>;
  user?: Partial<ResolvedUser>;
};

/**
 * Test helper: builds a ToolContext with a stub API client that records
 * every call. Excluded from the published build (see tsconfig.build.json).
 */
export function makeCtx(options: MakeCtxOptions = {}): { ctx: ToolContext; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const client = {
    get: async (path: string) => {
      calls.push({ method: 'GET', path });
      return options.get?.(path) ?? { ok: true, data: null };
    },
    post: async (path: string, body?: unknown) => {
      calls.push({ method: 'POST', path, body });
      return options.post?.(path, body) ?? { ok: true, data: null };
    },
    put: async (path: string, body?: unknown) => {
      calls.push({ method: 'PUT', path, body });
      return options.put?.(path, body) ?? { ok: true, data: null };
    },
    delete: async (path: string) => {
      calls.push({ method: 'DELETE', path });
      return options.delete?.(path) ?? { ok: true, data: null };
    },
  } as unknown as RsappApiClient;
  const user: ResolvedUser = {
    id: 1,
    githubId: 'octo',
    isAdmin: false,
    roles: new Set(),
    courses: [],
    ...options.user,
  };
  return { ctx: { client, user }, calls };
}

export function apiOk<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function apiFail(status: number, message = 'boom'): ApiResult<never> {
  return { ok: false, status, message };
}
