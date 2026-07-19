import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { RsappApiClient } from './api-client.js';
import { createMcpServer } from './create-server.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { ResolvedUser, ToolBinding } from './types.js';

const registry: ToolBinding[] = [
  {
    tool: { name: 'student_tool', description: 'student only', inputSchema: { type: 'object', properties: {} } },
    schema: z.object({}),
    roles: ['student'],
    toolset: 'student',
    run: async ctx => `hello ${ctx.user.githubId}`,
  },
  {
    tool: {
      name: 'manager_tool',
      description: 'manager only',
      inputSchema: { type: 'object', properties: { value: { type: 'number' } }, required: ['value'] },
    },
    schema: z.object({ value: z.number() }),
    roles: ['manager'],
    toolset: 'course-management',
    run: async () => 'managed',
  },
];

function makeUser(roles: ('student' | 'manager')[]): ResolvedUser {
  return { id: 1, githubId: 'octo', isAdmin: false, roles: new Set(roles), courses: [] };
}

async function connect(user: ResolvedUser) {
  const server = createMcpServer({ client: {} as RsappApiClient, user, registry });
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe('createMcpServer', () => {
  it('advertises only tools matching the user roles', async () => {
    const client = await connect(makeUser(['student']));
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name)).toEqual(['student_tool']);
  });

  it('runs an available tool with the user in context', async () => {
    const client = await connect(makeUser(['student']));
    const result = await client.callTool({ name: 'student_tool', arguments: {} });
    expect(result.content).toEqual([{ type: 'text', text: 'hello octo' }]);
  });

  it('rejects calling a tool outside the filtered set', async () => {
    const client = await connect(makeUser(['student']));
    const result = await client.callTool({ name: 'manager_tool', arguments: { value: 1 } });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('not available for your role');
  });

  it('rejects invalid input with a validation message', async () => {
    const client = await connect(makeUser(['manager']));
    const result = await client.callTool({ name: 'manager_tool', arguments: { value: 'oops' } });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('Invalid input');
  });
});
