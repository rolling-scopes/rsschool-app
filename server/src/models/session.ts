export interface IUserSession {
  id: number;
  isAdmin: boolean;
  isHirer: boolean;
  githubId: string;
  roles: StundetMentorRoles;
  coursesRoles?: CourseRoles;
  courses?: Record<number, CourseInfo>;
  isGuest?: boolean;
}

interface CourseInfo {
  mentorId: number | null;
  studentId: number | null;
  roles: CourseRole[];
}

export type StundetMentorRoles = { [key: string]: 'student' | 'mentor' };

export interface CourseRoles {
  [key: string]: CourseRole[] | undefined;
}

export const enum CourseRole {
  TaskOwner = 'taskOwner',
  JuryActivist = 'juryActivist',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}
