export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  roles: StundetMentorRoles;
  courses: Record<number, CourseInfo>;
}

export interface CourseInfo {
  mentorId: number;
  studentId: number;
  roles: NewCourseRole[];
}

export const enum NewCourseRole {
  TaskOwner = 'taskOwner',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

export type StundetMentorRoles = { [key: string]: 'student' | 'mentor' };

export const enum CourseRole {
  TaskOwner = 'taskOwner',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

function hasRole(user?: IUserSession, courseId?: number, role?: NewCourseRole) {
  return courseId && role ? user?.courses?.[courseId]?.roles.includes(role) ?? false : false;
}

function hasRoleInAny(user?: IUserSession, role?: NewCourseRole) {
  return Object.keys(user?.courses ?? {}).some(courseId => hasRole(user, Number(courseId), role));
}

export const isAdmin = (user?: IUserSession) => user?.isAdmin ?? false;
export const isHirer = (user?: IUserSession) => user?.isHirer ?? false;

export const isAnyManager = (user?: IUserSession) => hasRoleInAny(user, NewCourseRole.Manager);
export const isAnySupervisor = (user?: IUserSession) => hasRoleInAny(user, NewCourseRole.Supervisor);
export const isManager = (user?: IUserSession, courseId?: number) =>
  isAdmin(user) || hasRole(user, courseId, NewCourseRole.Manager);
export const isMentor = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, NewCourseRole.Mentor);
export const isAnyMentor = (user?: IUserSession) => hasRoleInAny(user, NewCourseRole.Mentor);
export const isStudent = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, NewCourseRole.Student);
export const isTaskOwner = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, NewCourseRole.TaskOwner);
export const isSupervisor = (user?: IUserSession, courseId?: number) =>
  hasRole(user, courseId, NewCourseRole.Supervisor);
