export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isActivist: boolean;
  githubId: string;
  roles: { [key: number]: 'student' | 'mentor' };
}
