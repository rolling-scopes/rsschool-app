import { SessionProvider } from '@client/modules/Course/contexts';
import { CourseRole } from 'services/models';
import { EventsAdminPage } from '@client/modules/EventsAdmin';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
      <EventsAdminPage />
    </SessionProvider>
  );
}
