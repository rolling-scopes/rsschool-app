import { Session } from 'components/withSession';
import { StudentBasic as CommonStudentBasic, DiscordServer, UserGroup } from 'common/models';
import type { ProfileCourseDto } from 'api';

export type Course = ProfileCourseDto;
export type StudentBasic = CommonStudentBasic;

export type { DiscordServer };
export type { UserGroup };

export interface Mentor {
  lastName: string;
  firstName: string;
  githubId: string;

  studentId: number;
  userId: number;
  courseId: number;
}

export interface PageWithModalState<T> {
  data: T[];
  modalData: Partial<T> | null;
  modalAction: 'update' | 'create';
}

export interface CoursePageProps {
  session: Session;
  course: Course;
  params: Record<string, string>;
}

export type CourseOnlyPageProps = {
  course: Course;
  params?: Record<string, string>;
};
