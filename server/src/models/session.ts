export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  roles: { [key: string]: 'student' | 'mentor' | 'coursemanager' };
  coursesRoles?: CourseRoles;
  isGuest?: boolean;
}

export interface CourseRoles {
  [key: string]: CourseRole[] | undefined;
}

export type CourseRole = 'taskOwner' | 'juryActivist' | 'manager' | 'supervisor';
