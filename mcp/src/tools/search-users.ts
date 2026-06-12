import { z } from 'zod';
import { describeError, type RsappApiClient } from '../api-client.js';

export const searchUsersInputSchema = z.object({
  query: z.string().min(1).describe('Search string: name, GitHub login, or numeric user ID'),
  includeSystem: z.boolean().optional().describe('Admin-only. When true, system accounts are included in results.'),
});

export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

export const SEARCH_USERS_TOOL = {
  name: 'search_users',
  description:
    'Find users by name, GitHub login, or numeric ID. Returns up to 20 matches with id, githubId and name. Useful when the human user refers to a student or mentor by partial name. Requires the PAT user to be admin or a course manager. Read-only.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', minLength: 1, description: 'Search string: name, GitHub login, or numeric user ID' },
      includeSystem: {
        type: 'boolean',
        description: 'Admin-only. When true, system accounts are included in results.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
} as const;

type UserRow = {
  id: number;
  githubId: string;
  name?: string | null;
};

export async function runSearchUsers(client: RsappApiClient, input: SearchUsersInput): Promise<string> {
  const params = new URLSearchParams({ query: input.query });
  if (input.includeSystem) params.set('includeSystem', 'true');
  const result = await client.get<UserRow[]>(`/api/v2/users/search?${params.toString()}`);
  if (!result.ok) {
    return describeError(result.status, result.message);
  }
  if (result.data.length === 0) {
    return `No users matched "${input.query}".`;
  }
  const rows = result.data.map(u => `- ${u.githubId}${u.name ? ` — ${u.name}` : ''} (id=${u.id})`);
  return [`Found ${result.data.length} user(s):`, ...rows].join('\n');
}
