import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { ActiveCourseProvider } from 'modules/Course/contexts/ActiveCourseContext';
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

export default withSession(Page);
