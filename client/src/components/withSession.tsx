import { CourseRole } from 'services/models';

export interface CourseInfo {
  mentorId?: number;
  studentId?: number;
  roles: CourseRole[];
  isExpelled?: boolean;
}

export interface Session {
  id: number;
  githubId: string;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  courses: { [courseId: number | string]: CourseInfo | undefined };
}
