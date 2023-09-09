import { ProfileCourseDto } from 'api';
import { Session } from 'components/withSession';
import { isCourseManager } from 'domain/user';
import { CourseRole } from 'services/models';

export function isExportEnabled({ session, course }: { session: Session; course: ProfileCourseDto }) {
  const { isAdmin, isHirer, courses } = session;
  const courseId = course.id;
  const { roles } = courses?.[courseId] ?? { roles: [] };
  const csvEnabled =
    isAdmin ||
    isHirer ||
    isCourseManager(session, courseId) ||
    roles?.includes(CourseRole.Manager) ||
    roles?.includes(CourseRole.Supervisor);
  return csvEnabled;
}
