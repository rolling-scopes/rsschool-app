import { AutoTests } from 'modules/AutoTest/pages';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider>
        <AutoTests />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
