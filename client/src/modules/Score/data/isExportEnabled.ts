import { CoursePageProps } from 'services/models';
import { CourseRole } from 'components/withSession';
import { isCourseManager } from 'domain/user';

export function isExportEnabled(props: CoursePageProps) {
  const { session } = props;
  const { isAdmin, isHirer, courses } = session;
  const courseId = props.course.id;
  const { roles } = courses?.[courseId] ?? { roles: [] };
  const csvEnabled =
    isAdmin ||
    isHirer ||
    isCourseManager(session, courseId) ||
    roles?.includes(CourseRole.Manager) ||
    roles?.includes(CourseRole.Supervisor);
  return csvEnabled;
}
