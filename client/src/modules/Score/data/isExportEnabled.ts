import { CoursePageProps } from 'services/models';

export function isExportEnabled(props: CoursePageProps) {
  const { isAdmin, isHirer, roles, coursesRoles } = props.session;
  const courseId = props.course.id;
  const courseRole = coursesRoles?.[courseId];
  const csvEnabled =
    isAdmin ||
    isHirer ||
    roles[courseId] === 'coursemanager' ||
    courseRole?.includes('manager') ||
    courseRole?.includes('supervisor');
  return csvEnabled;
}
