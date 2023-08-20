import withSession from 'components/withSession';
import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { UserNotificationsPage } from 'modules/Notifications/pages/UserNotificationsSettingsPage';

function PageWithContext() {
  return (
    <SessionAndCourseProvider>
      <UserNotificationsPage />
    </SessionAndCourseProvider>
  );
}

export default withSession(PageWithContext);
