import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Students } from 'modules/Mentor/pages/Students';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor]}>
        <Students />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
