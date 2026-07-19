import { describeError, type RsappApiClient } from './api-client.js';
import {
  TOOLSETS,
  type CourseMembership,
  type ResolvedUser,
  type ToolBinding,
  type ToolRole,
  type Toolset,
} from './types.js';

/** Shape of `GET /session` (raw AuthUser serialization from the NestJS backend). */
type SessionPayload = {
  id: number;
  githubId: string;
  isAdmin: boolean;
  courses?: Record<string, { roles?: string[]; mentorId?: number; studentId?: number; isExpelled?: boolean }>;
};

const COURSE_ROLE_MAP: Record<string, ToolRole> = {
  student: 'student',
  mentor: 'mentor',
  manager: 'manager',
  supervisor: 'supervisor',
  dementor: 'dementor',
  taskOwner: 'taskOwner',
};

export async function resolveUser(client: RsappApiClient): Promise<ResolvedUser> {
  const result = await client.get<SessionPayload>('/session');
  if (!result.ok) {
    throw new Error(`Failed to resolve the PAT user. ${describeError(result.status, result.message)}`);
  }
  const session = result.data;
  const courses: CourseMembership[] = Object.entries(session.courses ?? {}).map(([courseId, info]) => ({
    courseId: Number(courseId),
    roles: (info.roles ?? []).map(role => COURSE_ROLE_MAP[role]).filter((role): role is ToolRole => role !== undefined),
    mentorId: info.mentorId,
    studentId: info.studentId,
    isExpelled: info.isExpelled,
  }));

  const roles = new Set<ToolRole>();
  for (const course of courses) {
    for (const role of course.roles) {
      // An expelled student keeps the membership record but must not unlock
      // student tools — the backend would deny every call anyway.
      if (role === 'student' && course.isExpelled) {
        continue;
      }
      roles.add(role);
    }
  }
  if (session.isAdmin) {
    roles.add('admin');
  }

  return { id: session.id, githubId: session.githubId, isAdmin: !!session.isAdmin, roles, courses };
}

export function satisfiesRoles(binding: ToolBinding, user: ResolvedUser): boolean {
  if (binding.roles.length === 0 || user.isAdmin) {
    return true;
  }
  return binding.roles.some(role => user.roles.has(role));
}

/**
 * Defense-in-depth per-course check for course-scoped tools. `satisfiesRoles`
 * only proves the user holds a required role in *some* course (the union set);
 * a tool acting on a specific `courseId` must additionally verify the role is
 * held in *that* course, otherwise a manager of course A could act on course B.
 * Admin bypasses; an empty `roles` list means any membership in the course is
 * enough.
 */
export function hasCourseRole(user: ResolvedUser, courseId: number, roles: readonly ToolRole[]): boolean {
  if (user.isAdmin) {
    return true;
  }
  const membership = user.courses.find(course => course.courseId === courseId);
  if (!membership) {
    return false;
  }
  return roles.length === 0 || roles.some(role => membership.roles.includes(role));
}

export function parseToolsets(raw: string | undefined): Toolset[] | undefined {
  if (raw === undefined || raw.trim() === '') {
    return undefined;
  }
  const requested = raw
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
  const unknown = requested.filter(name => !(TOOLSETS as readonly string[]).includes(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown toolset(s): ${unknown.join(', ')}. Valid toolsets: ${TOOLSETS.join(', ')}`);
  }
  return requested as Toolset[];
}

export function filterTools(registry: ToolBinding[], user: ResolvedUser, toolsets?: Toolset[]): ToolBinding[] {
  return registry.filter(
    binding => (toolsets === undefined || toolsets.includes(binding.toolset)) && satisfiesRoles(binding, user),
  );
}
