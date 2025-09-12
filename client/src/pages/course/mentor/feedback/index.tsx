import { CourseRole } from 'services/models';
import { SessionProvider } from 'modules/Course/contexts';
import { StudentFeedback } from 'modules/Mentor/pages/StudentFeedback';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <StudentFeedback />
    </SessionProvider>
  );
}
