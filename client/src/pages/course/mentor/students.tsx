import { SessionProvider } from '@client/modules/Course/contexts';
import { Students } from '@client/modules/Mentor/pages/Students';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <Students />
    </SessionProvider>
  );
}
