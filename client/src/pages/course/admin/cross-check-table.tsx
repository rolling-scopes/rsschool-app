import { SessionProvider } from '@client/modules/Course/contexts';
import { CrossCheckPairs } from '@client/modules/CrossCheckPairs/pages/CrossCheckPairs';
import { CourseRole } from '@client/services/models';

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
      <CrossCheckPairs />
    </SessionProvider>
  );
}
