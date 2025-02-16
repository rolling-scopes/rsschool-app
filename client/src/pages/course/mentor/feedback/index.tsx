import { CourseRole } from 'services/models';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { StudentFeedback } from 'modules/Mentor/pages/StudentFeedback';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor]}>
        <StudentFeedback />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
