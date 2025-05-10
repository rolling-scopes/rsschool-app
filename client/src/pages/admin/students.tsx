import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Students } from 'modules/Students/Pages/Students';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider hirerOnly>
        <Students />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
