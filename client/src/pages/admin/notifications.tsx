import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { AdminPage } from 'modules/Notifications/pages/AdminNotificationsPage';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <AdminPage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
