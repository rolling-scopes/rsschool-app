import { CourseRole } from 'services/models';
import { SessionProvider } from 'modules/Course/contexts';
import { TasksPage } from 'modules/Tasks/pages';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <TasksPage />
    </SessionProvider>
  );
}
