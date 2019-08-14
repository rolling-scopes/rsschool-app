export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  githubId: string;
  roles: { [key: string]: 'student' | 'mentor' | 'coursemanager' };
}
