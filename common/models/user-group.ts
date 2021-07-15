type Roles = 'juryActivist' | 'manager' | 'supervisor';

export interface UserGroup {
  id: number;
  name: string;
  roles: Roles[];
  users: {
    id: number;
    githubId: string;
    name: string;
  }[];
}
