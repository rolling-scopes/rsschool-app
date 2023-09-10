import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { ConnectionConfirmed } from 'modules/Notifications/pages/ConnectionConfirmedPage';

function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <ConnectionConfirmed />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
