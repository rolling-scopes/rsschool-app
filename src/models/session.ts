export interface IUserSession {
  id: number;
  role: 'mentor' | 'student';
  isAdmin: boolean;
  githubId: string;
}
