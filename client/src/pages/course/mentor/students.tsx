import { SessionProvider } from 'modules/Course/contexts';
import { Students } from 'modules/Mentor/pages/Students';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <Students />
    </SessionProvider>
  );
}
