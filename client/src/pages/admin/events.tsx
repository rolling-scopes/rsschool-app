import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';
import { EventsAdminPage } from 'modules/EventsAdmin';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <EventsAdminPage />
    </SessionProvider>
  );
}
