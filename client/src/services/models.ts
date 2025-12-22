import { Session } from 'components/withSession';
import { StudentBasic as CommonStudentBasic } from '@common/models';
import { ProfileCourseDto, UserGroupDtoRolesEnum as CourseRole } from '@client/api';

export type Course = ProfileCourseDto;
export type StudentBasic = CommonStudentBasic;

export { CourseRole };

export interface CoursePageProps {
  session?: Session;
  course: Course;
  params?: Record<string, string>;
}

export type CourseOnlyPageProps = {
  course: Course;
  params?: Record<string, string>;
};
