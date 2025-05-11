import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { MentorDashboard } from 'modules/Mentor/components';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor]}>
        <MentorDashboard />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
