import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Teams } from 'modules/Teams';

export function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider>
        <Teams />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;
