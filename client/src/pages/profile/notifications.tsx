import { SessionProvider } from '@client/modules/Course/contexts';
import { UserNotificationsPage } from '@client/modules/Notifications/pages/UserNotificationsSettingsPage';

function Page() {
  return (
    <SessionProvider>
      <UserNotificationsPage />
    </SessionProvider>
  );
}

export default Page;
