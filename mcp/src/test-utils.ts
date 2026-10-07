import type { ApiResult, RsappApiClient } from './api-client.js';
import { isToolFailure, type ResolvedUser, type ToolContext, type ToolResult } from './types.js';

/** Text of a tool result, whether it succeeded or failed. */
export function toText(result: ToolResult): string {
  return isToolFailure(result) ? result.text : result;
}

/** Asserts the tool reported a failure and returns its text. */
export function failureText(result: ToolResult): string {
  if (!isToolFailure(result)) {
    throw new Error(`Expected a tool failure, got a success result: ${result}`);
  }
  return result.text;
}

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
    // create-server tags the client with the tool name before running a tool;
    // the stub just returns itself so calls are still recorded in one place.
    withTool() {
      return this;
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
