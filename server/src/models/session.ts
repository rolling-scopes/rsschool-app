export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  roles: StundetMentorRoles;
  coursesRoles?: CourseRoles;
  isGuest?: boolean;
}

export type StundetMentorRoles = { [key: string]: 'student' | 'mentor' };

export interface CourseRoles {
  [key: string]: CourseRole[] | undefined;
}

export const enum CourseRole {
  taskOwner = 'taskOwner',
  juryActivist = 'juryActivist',
  manager = 'manager',
  supervisor = 'supervisor',
}
