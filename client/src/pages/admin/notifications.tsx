import withSession, { Session } from 'components/withSession';
import { AdminPage } from 'modules/Notifications/pages/AdminNotificationsPage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { Course } from 'services/models';
import { SessionProvider } from 'modules/Course/contexts';

export { getServerSideProps };

function PageWithContext(props: { session: Session; courses: Course[] }) {
  return (
    <SessionProvider>
      <AdminPage {...props} />
    </SessionProvider>
  );
}

export default withSession(PageWithContext, { onlyForAdmin: true });
