import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { ApiResult, RsappApiClient } from './api-client.js';
import { filterTools, parseToolsets, resolveUser, satisfiesRoles } from './roles.js';
import type { ResolvedUser, ToolBinding, ToolRole } from './types.js';

function fakeClient(session: unknown, ok = true): RsappApiClient {
  return {
    get: async () =>
      (ok ? { ok: true, data: session } : { ok: false, status: 401, message: 'nope' }) as ApiResult<never> as never,
    post: async () => {
      throw new Error('not used');
    },
  } as unknown as RsappApiClient;
}

function makeUser(roles: ToolRole[], isAdmin = false): ResolvedUser {
  return { id: 1, githubId: 'test', isAdmin, roles: new Set(roles), courses: [] };
}

function makeBinding(name: string, roles: ToolRole[], toolset: ToolBinding['toolset']): ToolBinding {
  return {
    tool: { name, description: '', inputSchema: {} },
    schema: z.object({}),
    roles,
    toolset,
    run: async () => 'ok',
  };
}

describe('resolveUser', () => {
  it('maps course roles and skips student role for expelled courses', async () => {
    const user = await resolveUser(
      fakeClient({
        id: 10,
        githubId: 'octo',
        isAdmin: false,
        courses: {
          1: { roles: ['student'], studentId: 100, isExpelled: true },
          2: { roles: ['mentor'], mentorId: 200 },
          3: { roles: ['manager', 'dementor'] },
        },
      }),
    );
    expect(user.roles.has('student')).toBe(false);
    expect(user.roles.has('mentor')).toBe(true);
    expect(user.roles.has('manager')).toBe(true);
    expect(user.roles.has('dementor')).toBe(true);
    expect(user.courses.find(c => c.courseId === 2)?.mentorId).toBe(200);
  });

  it('keeps student role for active courses even if expelled elsewhere', async () => {
    const user = await resolveUser(
      fakeClient({
        id: 10,
        githubId: 'octo',
        isAdmin: false,
        courses: {
          1: { roles: ['student'], isExpelled: true },
          2: { roles: ['student'], studentId: 5 },
        },
      }),
    );
    expect(user.roles.has('student')).toBe(true);
  });

  it('adds admin role and ignores unknown course roles', async () => {
    const user = await resolveUser(
      fakeClient({ id: 1, githubId: 'a', isAdmin: true, courses: { 1: { roles: ['activist', 'unknown'] } } }),
    );
    expect(user.isAdmin).toBe(true);
    expect(user.roles.has('admin')).toBe(true);
    expect(user.roles.size).toBe(1);
  });

  it('throws with a readable message when the session call fails', async () => {
    await expect(resolveUser(fakeClient(null, false))).rejects.toThrow(/Failed to resolve the PAT user/);
  });
});

describe('satisfiesRoles / filterTools', () => {
  const registry = [
    makeBinding('any_tool', [], 'common'),
    makeBinding('student_tool', ['student'], 'student'),
    makeBinding('mentor_tool', ['mentor'], 'mentor'),
    makeBinding('manager_tool', ['manager'], 'course-management'),
  ];

  it('empty roles list means any authenticated user', () => {
    expect(satisfiesRoles(registry[0]!, makeUser([]))).toBe(true);
  });

  it('student sees common + student tools only', () => {
    const tools = filterTools(registry, makeUser(['student'])).map(b => b.tool.name);
    expect(tools).toEqual(['any_tool', 'student_tool']);
  });

  it('multi-role user gets the union', () => {
    const tools = filterTools(registry, makeUser(['student', 'mentor'])).map(b => b.tool.name);
    expect(tools).toEqual(['any_tool', 'student_tool', 'mentor_tool']);
  });

  it('admin sees everything', () => {
    const tools = filterTools(registry, makeUser(['admin'], true)).map(b => b.tool.name);
    expect(tools).toHaveLength(registry.length);
  });

  it('toolsets narrow the selection further', () => {
    const tools = filterTools(registry, makeUser(['admin'], true), ['student']).map(b => b.tool.name);
    expect(tools).toEqual(['student_tool']);
  });
});

describe('parseToolsets', () => {
  it('returns undefined for empty input', () => {
    expect(parseToolsets(undefined)).toBeUndefined();
    expect(parseToolsets('  ')).toBeUndefined();
  });

  it('parses a comma-separated list', () => {
    expect(parseToolsets('common, student')).toEqual(['common', 'student']);
  });

  it('fails fast on unknown toolsets, listing valid ones', () => {
    expect(() => parseToolsets('common,bogus')).toThrow(/Unknown toolset\(s\): bogus/);
  });
});
