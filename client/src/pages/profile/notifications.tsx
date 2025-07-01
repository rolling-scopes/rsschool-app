import { SessionProvider } from 'modules/Course/contexts';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function Page() {
  return (
    <SessionProvider>
      <UserNotificationsPage />
    </SessionProvider>
  );
}

export default Page;
