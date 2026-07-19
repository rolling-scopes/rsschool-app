import { z } from 'zod';
import { describeError } from '../api-client.js';
import { toJsonBlock } from '../format.js';
import type { ToolContext } from '../types.js';

export const getMyProfileInputSchema = z.object({});

export type GetMyProfileInput = z.infer<typeof getMyProfileInputSchema>;

export const GET_MY_PROFILE_TOOL = {
  name: 'get_my_profile',
  description:
    'Get the profile of the PAT user: name, GitHub login, contacts and public info. Use it to learn who the current user is. Read-only, no side effects.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
} as const;

export async function runGetMyProfile(ctx: ToolContext, _input: GetMyProfileInput): Promise<string> {
  const result = await ctx.client.get<unknown>('/profile/me');
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  return toJsonBlock(result.data);
}
