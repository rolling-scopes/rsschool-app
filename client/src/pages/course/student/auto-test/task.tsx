import { Task } from 'modules/AutoTest/pages';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { CourseRole } from 'services/models';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Student]}>
        <Task />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
