import { SessionProvider } from '@client/modules/Course/contexts';
import { MentorDashboard } from '@client/modules/Mentor/components';
import { CourseRole } from '@client/services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <MentorDashboard />
    </SessionProvider>
  );
}
