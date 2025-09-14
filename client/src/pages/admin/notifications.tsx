import { SessionProvider } from 'modules/Course/contexts';
import { AdminPage } from 'modules/Notifications/pages/AdminNotificationsPage';

export default function () {
  return (
    <SessionProvider adminOnly>
      <AdminPage />
    </SessionProvider>
  );
}
