import { AdminPageLayout } from 'components/PageLayout';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  const { courses } = useActiveCourseContext();
  return (
    <AdminPageLayout title="Manage Discord Servers" loading={false} courses={courses}>
      auto-test
    </AdminPageLayout>
  );
}
export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} adminOnly>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
