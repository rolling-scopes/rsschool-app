import withSession from 'components/withSession';
import { AdminPage } from 'modules/Notifications/pages/AdminNotificationsPage';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';

export { getServerSideProps };
export default withSession(AdminPage);
