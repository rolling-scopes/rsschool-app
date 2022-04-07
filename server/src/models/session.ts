export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  courses: Record<number, CourseInfo>;
}

export interface CourseInfo {
  mentorId?: number;
  studentId?: number;
  roles: CourseRole[];
}

export const enum CourseRole {
  TaskOwner = 'taskOwner',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

function hasRole(user?: IUserSession, courseId?: number, role?: CourseRole) {
  return courseId && role ? user?.courses?.[courseId]?.roles.includes(role) ?? false : false;
}

function hasRoleInAny(user?: IUserSession, role?: CourseRole) {
  return Object.keys(user?.courses ?? {}).some(courseId => hasRole(user, Number(courseId), role));
}

export const isAdmin = (user?: IUserSession) => user?.isAdmin ?? false;
export const isHirer = (user?: IUserSession) => user?.isHirer ?? false;

export const isAnyManager = (user?: IUserSession) => hasRoleInAny(user, CourseRole.Manager);
export const isAnySupervisor = (user?: IUserSession) => hasRoleInAny(user, CourseRole.Supervisor);
export const isManager = (user?: IUserSession, courseId?: number) =>
  isAdmin(user) || hasRole(user, courseId, CourseRole.Manager);
export const isMentor = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, CourseRole.Mentor);
export const isAnyMentor = (user?: IUserSession) => hasRoleInAny(user, CourseRole.Mentor);
export const isStudent = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, CourseRole.Student);
export const isTaskOwner = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, CourseRole.TaskOwner);
export const isSupervisor = (user?: IUserSession, courseId?: number) => hasRole(user, courseId, CourseRole.Supervisor);
