import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function PageWithContext() {
  return (
    <SessionProvider>
      <UserNotificationsPage />
    </SessionProvider>
  );
}

export default withSession(PageWithContext);
