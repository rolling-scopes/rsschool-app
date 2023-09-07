import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { ActiveCourseProvider } from 'modules/Course/contexts/ActiveCourseContext';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function PageWithContext() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <UserNotificationsPage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default withSession(PageWithContext);
