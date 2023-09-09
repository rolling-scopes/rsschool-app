import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CrossCheckPairs } from 'modules/CrossCheckPairs/pages/CrossCheckPairs';
import { CourseRole } from 'services/models';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Dementor]}>
        <CrossCheckPairs />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
