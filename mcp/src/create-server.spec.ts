import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { RsappApiClient } from './api-client.js';
import { courseIdFromInput, createMcpServer } from './create-server.js';
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

describe('courseIdFromInput', () => {
  it('extracts a positive integer courseId', () => {
    expect(courseIdFromInput({ courseId: 5 })).toBe(5);
  });

  it('returns undefined when courseId is absent', () => {
    expect(courseIdFromInput({ other: 1 })).toBeUndefined();
  });

  it('returns undefined for a non-number courseId', () => {
    expect(courseIdFromInput({ courseId: '5' })).toBeUndefined();
  });

  it('returns undefined for a non-integer or non-positive courseId', () => {
    expect(courseIdFromInput({ courseId: 1.5 })).toBeUndefined();
    expect(courseIdFromInput({ courseId: 0 })).toBeUndefined();
    expect(courseIdFromInput({ courseId: -3 })).toBeUndefined();
  });

  it('returns undefined for non-objects', () => {
    expect(courseIdFromInput(null)).toBeUndefined();
    expect(courseIdFromInput(7)).toBeUndefined();
  });
});

describe('createMcpServer per-course authorization', () => {
  const courseRegistry: ToolBinding[] = [
    {
      tool: {
        name: 'course_manager_tool',
        description: 'manager, course-scoped',
        inputSchema: { type: 'object', properties: { courseId: { type: 'number' } }, required: ['courseId'] },
      },
      schema: z.object({ courseId: z.number() }),
      roles: ['manager'],
      toolset: 'course-management',
      run: async () => 'done',
    },
    {
      tool: {
        name: 'common_course_tool',
        description: 'any user, course-scoped',
        inputSchema: { type: 'object', properties: { courseId: { type: 'number' } }, required: ['courseId'] },
      },
      schema: z.object({ courseId: z.number() }),
      roles: [],
      toolset: 'common',
      run: async () => 'ok',
    },
  ];

  function managerOf(courseId: number, isAdmin = false): ResolvedUser {
    return {
      id: 1,
      githubId: 'octo',
      isAdmin,
      roles: new Set(['manager']),
      courses: [{ courseId, roles: ['manager'] }],
    };
  }

  async function connectWith(user: ResolvedUser) {
    const server = createMcpServer({ client: {} as RsappApiClient, user, registry: courseRegistry });
    const client = new Client({ name: 'test-client', version: '0.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    return client;
  }

  it('allows a course-scoped tool in a course where the user holds the role', async () => {
    const client = await connectWith(managerOf(5));
    const result = await client.callTool({ name: 'course_manager_tool', arguments: { courseId: 5 } });
    expect(result.content).toEqual([{ type: 'text', text: 'done' }]);
  });

  it('blocks a course-scoped tool against a different course (cross-course)', async () => {
    const client = await connectWith(managerOf(5));
    const result = await client.callTool({ name: 'course_manager_tool', arguments: { courseId: 9 } });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('in course 9');
  });

  it('lets an admin call a course-scoped tool for any course', async () => {
    const client = await connectWith(managerOf(5, true));
    const result = await client.callTool({ name: 'course_manager_tool', arguments: { courseId: 9 } });
    expect(result.content).toEqual([{ type: 'text', text: 'done' }]);
  });

  it('does not course-gate a tool with no role requirement', async () => {
    const anyUser: ResolvedUser = { id: 2, githubId: 'a', isAdmin: false, roles: new Set(), courses: [] };
    const client = await connectWith(anyUser);
    const result = await client.callTool({ name: 'common_course_tool', arguments: { courseId: 9 } });
    expect(result.content).toEqual([{ type: 'text', text: 'ok' }]);
  });
});
