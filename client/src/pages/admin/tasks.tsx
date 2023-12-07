import { CourseRole } from 'services/models';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { TasksPage } from 'modules/Tasks/pages';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]}>
        <TasksPage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
