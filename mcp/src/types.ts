import type { z } from 'zod';
import type { RsappApiClient } from './api-client.js';

/**
 * Roles the MCP server understands. `admin` is app-level; the rest are
 * per-course roles aggregated across all courses of the PAT user.
 */
export type ToolRole = 'student' | 'mentor' | 'manager' | 'supervisor' | 'dementor' | 'taskOwner' | 'admin';

export const TOOLSETS = ['common', 'student', 'mentor', 'course-management', 'course-admin', 'users'] as const;

export type Toolset = (typeof TOOLSETS)[number];

export type CourseMembership = {
  courseId: number;
  roles: ToolRole[];
  mentorId?: number;
  studentId?: number;
  isExpelled?: boolean;
};

export type ResolvedUser = {
  id: number;
  githubId: string;
  isAdmin: boolean;
  /** Union of roles across all courses (student excluded for expelled courses), plus `admin`. */
  roles: ReadonlySet<ToolRole>;
  courses: CourseMembership[];
};

export type ToolContext = {
  client: RsappApiClient;
  user: ResolvedUser;
};

export type ToolAnnotations = {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  /** Repeating the call with the same arguments has no additional effect. */
  idempotentHint?: boolean;
  /**
   * Whether the tool touches an open-ended external world. Always false here:
   * every tool speaks to exactly one closed RS School API. The spec defaults
   * this to true, so it must be set explicitly.
   */
  openWorldHint?: boolean;
};

/**
 * A failed tool call. Tools return this instead of a bare string so the
 * protocol-level `isError` flag is set — otherwise a 403 is indistinguishable
 * from real data for the model.
 */
export type ToolFailure = { isError: true; text: string };

export type ToolResult = string | ToolFailure;

export function toolError(text: string): ToolFailure {
  return { isError: true, text };
}

export function isToolFailure(result: ToolResult): result is ToolFailure {
  return typeof result !== 'string';
}

export type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: unknown;
  annotations?: ToolAnnotations;
};

export type ToolBinding = {
  tool: ToolDescriptor;
  schema: z.ZodTypeAny;
  /** Roles that unlock the tool. Empty array = any authenticated user. Admin always passes. */
  roles: ToolRole[];
  toolset: Toolset;
  run: (ctx: ToolContext, input: never) => Promise<ToolResult>;
};
