import { AdminPageLayout } from 'components/PageLayout';
import { SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';
import ExpelledStudentsStats from '@client/modules/CourseManagement/components/ExpelledStudentsStats';

function Page() {
  const { courses } = useActiveCourseContext();

  return (
    <AdminPageLayout loading={false} showCourseName courses={courses}>
      <ExpelledStudentsStats />
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>
      <Page />
    </SessionProvider>
  );
}
