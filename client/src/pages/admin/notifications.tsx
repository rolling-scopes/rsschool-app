import { SessionProvider } from '@client/modules/Course/contexts';
import { AdminPage } from '@client/modules/Notifications/pages/AdminNotificationsPage';

export default function () {
  return (
    <SessionProvider adminOnly>
      <AdminPage />
    </SessionProvider>
  );
}
