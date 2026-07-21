import { DEFAULT_API_PREFIX, DEFAULT_TIMEOUT_MS } from './api-client.js';
import { parseToolsets } from './roles.js';
import type { Toolset } from './types.js';

export type StdioConfig = {
  baseUrl: string;
  token: string;
  apiPrefix: string;
  timeoutMs: number;
  toolsets?: Toolset[];
};

/** Parse a positive-integer env var, falling back to `fallback` when unset or invalid. */
export function readTimeoutMs(raw: string | undefined, fallback = DEFAULT_TIMEOUT_MS): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`RSAPP_REQUEST_TIMEOUT_MS must be a positive number of milliseconds, got "${raw}"`);
  }
  return parsed;
}

export function readStdioConfig(env: NodeJS.ProcessEnv = process.env): StdioConfig {
  const baseUrl = env.RSAPP_BASE_URL;
  const token = env.RSAPP_PAT;
  if (!baseUrl) {
    throw new Error('RSAPP_BASE_URL env variable is required');
  }
  if (!token) {
    throw new Error('RSAPP_PAT env variable is required');
  }
  if (!token.startsWith('rsapp_pat_')) {
    throw new Error('RSAPP_PAT must start with "rsapp_pat_"');
  }
  return {
    baseUrl,
    token,
    apiPrefix: env.RSAPP_API_PREFIX ?? DEFAULT_API_PREFIX,
    timeoutMs: readTimeoutMs(env.RSAPP_REQUEST_TIMEOUT_MS),
    toolsets: parseToolsets(env.RSAPP_TOOLSETS),
  };
}
