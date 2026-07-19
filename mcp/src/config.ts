import { DEFAULT_API_PREFIX } from './api-client.js';
import { parseToolsets } from './roles.js';
import type { Toolset } from './types.js';

export type StdioConfig = {
  baseUrl: string;
  token: string;
  apiPrefix: string;
  toolsets?: Toolset[];
};

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
    toolsets: parseToolsets(env.RSAPP_TOOLSETS),
  };
}
