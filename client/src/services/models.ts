import { Session } from 'components/withSession';
import {
  Course as CommonCourse,
  StudentBasic as CommonStudentBasic,
  DiscordServer,
  UserGroup,
  InterviewQuestion,
  InterviewQuestionCategory,
} from 'common/models';

export interface Course extends CommonCourse {}
export interface StudentBasic extends CommonStudentBasic {}
export type { DiscordServer };
export type { UserGroup };
export type { InterviewQuestion };
export type { InterviewQuestionCategory };

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
