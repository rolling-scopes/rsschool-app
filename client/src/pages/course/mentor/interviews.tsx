import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Interviews } from 'modules/Mentor/pages/Interviews';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider>
        <Interviews />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
