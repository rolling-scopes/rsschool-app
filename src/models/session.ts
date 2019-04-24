export interface IUserSession {
  id: number;
  isAdmin: boolean;
  githubId: string;
  roles: { [key: number]: 'student' | 'mentor' };
}
