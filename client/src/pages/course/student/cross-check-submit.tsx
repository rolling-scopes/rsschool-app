import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from '../../../services/models';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Student]}>
        <CrossCheckSubmit />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
