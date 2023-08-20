import withSession from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function PageWithContext() {
  return (
    <DefaultPageProvider>
      <UserNotificationsPage />
    </DefaultPageProvider>
  );
}

export default withSession(PageWithContext);
