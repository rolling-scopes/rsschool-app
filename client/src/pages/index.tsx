import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { HomePage } from 'modules/Home/pages/HomePage';
function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <HomePage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
