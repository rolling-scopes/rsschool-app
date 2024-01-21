import { AdminDashboard } from 'modules/AdminDashboard';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor]}>
      <ActiveCourseProvider>
        <AdminDashboard />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
