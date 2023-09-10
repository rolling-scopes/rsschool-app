import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function Page() {
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <UserNotificationsPage />
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;
