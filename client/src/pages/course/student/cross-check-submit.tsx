import { CrossCheckSubmit } from '@client/modules/Course/pages/Student/CrossCheckSubmit';
import { SessionProvider } from '@client/modules/Course/contexts';
import { CourseRole } from '@client/services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]}>
      <CrossCheckSubmit />
    </SessionProvider>
  );
}

export default Page;
