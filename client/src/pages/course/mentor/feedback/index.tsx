import { CourseRole } from 'services/models';
import { SessionProvider } from '@client/modules/Course/contexts';
import { StudentFeedback } from '@client/modules/Mentor/pages/StudentFeedback';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <StudentFeedback />
    </SessionProvider>
  );
}
