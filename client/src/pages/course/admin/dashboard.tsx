import { AdminDashboard } from 'modules/AdminDashboard';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <AdminDashboard />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
