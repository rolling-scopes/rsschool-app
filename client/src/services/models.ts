import { Session } from 'components/withSession';
import { StudentBasic as CommonStudentBasic } from 'common/models';
import { ProfileCourseDto, UserGroupDtoRolesEnum as CourseRole, UserGroupDto as UserGroup } from 'api';

export type Course = ProfileCourseDto;
export type StudentBasic = CommonStudentBasic;

export { CourseRole };

export type { UserGroup };

export interface Mentor {
  lastName: string;
  firstName: string;
  githubId: string;

  studentId: number;
  userId: number;
  courseId: number;
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
