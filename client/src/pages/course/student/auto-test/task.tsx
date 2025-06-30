import { Task } from 'modules/AutoTest/pages';
import { SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]}>
      <Task />
    </SessionProvider>
  );
}

export default Page;
