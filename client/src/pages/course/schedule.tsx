import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { SchedulePage } from 'modules/Schedule/pages/SchedulePage';

export default function () {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <SchedulePage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}
