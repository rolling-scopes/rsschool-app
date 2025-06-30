import { CrossCheckSubmit } from 'modules/Course/pages/Student/CrossCheckSubmit';
import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from '../../../services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]}>
      <CrossCheckSubmit />
    </SessionProvider>
  );
}

export default Page;
