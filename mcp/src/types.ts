import type { z } from 'zod';
import type { RsappApiClient } from './api-client.js';

/**
 * Roles the MCP server understands. `admin` is app-level; the rest are
 * per-course roles aggregated across all courses of the PAT user.
 */
export type ToolRole = 'student' | 'mentor' | 'manager' | 'supervisor' | 'dementor' | 'taskOwner' | 'admin';

export const TOOLSETS = ['common', 'student', 'mentor', 'course-management', 'users'] as const;

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
};

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
  run: (ctx: ToolContext, input: never) => Promise<string>;
};
