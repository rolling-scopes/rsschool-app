import { describe, expect, it } from 'vitest';
import { TOOLS } from './registry.js';
import { TOOLSETS } from './types.js';

const WRITE_PREFIXES = [
  'issue_',
  'submit_',
  'create_',
  'update_',
  'delete_',
  'expel_',
  'register_',
  'approve_',
  'grant_',
  'complete_',
  'distribute_',
];

const DESTRUCTIVE_TOOLS = ['update_student_status', 'expel_students', 'delete_course_task', 'delete_course_event'];

describe('tool registry integrity', () => {
  it('has unique tool names', () => {
    const names = TOOLS.map(b => b.tool.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('uses only known toolsets', () => {
    const offenders = TOOLS.filter(b => !(TOOLSETS as readonly string[]).includes(b.toolset)).map(b => b.tool.name);
    expect(offenders).toEqual([]);
  });

  it('annotates every tool with readOnlyHint', () => {
    const offenders = TOOLS.filter(b => typeof b.tool.annotations?.readOnlyHint !== 'boolean').map(b => b.tool.name);
    expect(offenders).toEqual([]);
  });

  it('marks mutating tools as non-read-only', () => {
    const offenders = TOOLS.filter(
      b => WRITE_PREFIXES.some(prefix => b.tool.name.startsWith(prefix)) && b.tool.annotations?.readOnlyHint !== false,
    ).map(b => b.tool.name);
    expect(offenders).toEqual([]);
  });

  it('marks destructive tools with destructiveHint', () => {
    const flagged = TOOLS.filter(b => b.tool.annotations?.destructiveHint === true)
      .map(b => b.tool.name)
      .sort();
    expect(flagged).toEqual([...DESTRUCTIVE_TOOLS].sort());
  });

  it('gives every tool a meaningful description and an object input schema', () => {
    const shortDescriptions = TOOLS.filter(b => b.tool.description.length <= 20).map(b => b.tool.name);
    const badSchemas = TOOLS.filter(b => (b.tool.inputSchema as { type?: string }).type !== 'object').map(
      b => b.tool.name,
    );
    expect(shortDescriptions).toEqual([]);
    expect(badSchemas).toEqual([]);
  });

  it('keeps common tools role-free and non-common tools role-bound', () => {
    const commonWithRoles = TOOLS.filter(b => b.toolset === 'common' && b.roles.length > 0).map(b => b.tool.name);
    const scopedWithoutRoles = TOOLS.filter(b => b.toolset !== 'common' && b.roles.length === 0).map(b => b.tool.name);
    expect(commonWithRoles).toEqual([]);
    expect(scopedWithoutRoles).toEqual([]);
  });
});
