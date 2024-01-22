import { AdminDashboard } from 'modules/AdminDashboard';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor]}>
        <AdminDashboard />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
