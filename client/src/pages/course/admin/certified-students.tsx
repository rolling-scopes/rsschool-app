import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>Certified Students</SessionProvider>
  );
}
