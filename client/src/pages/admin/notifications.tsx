import withSession, { Session } from 'components/withSession';
import { AdminPage } from 'modules/Notifications/pages/AdminNotificationsPage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { Course } from 'services/models';
import { SessionAndCourseProvider } from 'modules/Course/contexts';

export { getServerSideProps };

function PageWithContext(props: { session: Session; courses: Course[] }) {
  return (
    <SessionAndCourseProvider>
      <AdminPage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withSession(PageWithContext, { onlyForAdmin: true });
