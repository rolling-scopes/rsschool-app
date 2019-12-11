export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  roles: { [key: string]: 'student' | 'mentor' | 'coursemanager' };
  coursesRoles?: CourseRole;
}

export interface CourseRole {
  [key: string]: ('taskOwner' | 'juryActivist')[] | undefined;
}
