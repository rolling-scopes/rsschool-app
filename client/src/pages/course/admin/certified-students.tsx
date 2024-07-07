import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>Certified Students</SessionProvider>
    </ActiveCourseProvider>
  );
}
