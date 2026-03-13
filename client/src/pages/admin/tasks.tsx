import { CourseRole } from 'services/models';
import { SessionProvider } from '@client/modules/Course/contexts';
import { TasksPage } from '@client/modules/Tasks/pages';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <TasksPage />
    </SessionProvider>
  );
}
