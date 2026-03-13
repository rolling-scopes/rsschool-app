import { SessionProvider } from '@client/modules/Course/contexts';
import { CourseRole } from 'services/models';
import { UsersAdminPage } from '@client/modules/UsersAdmin';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <UsersAdminPage />
    </SessionProvider>
  );
}
