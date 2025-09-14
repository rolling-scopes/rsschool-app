import { SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <MentorDashboard />
    </SessionProvider>
  );
}
