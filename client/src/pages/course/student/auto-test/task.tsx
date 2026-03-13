import { Task } from '@client/modules/AutoTest/pages';
import { SessionProvider } from '@client/modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]}>
      <Task />
    </SessionProvider>
  );
}

export default Page;
