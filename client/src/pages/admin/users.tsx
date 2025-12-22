import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';
import { UsersAdminPage } from 'modules/UsersAdmin';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <UsersAdminPage />
    </SessionProvider>
  );
}
