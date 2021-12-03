import { withSession } from 'components/withSession';
import { StudentFeedbacks } from 'modules/Feedback/pages/StudentFeedbacks';
import { withCourse } from 'components/withCourse';
import { getServerSideProps } from 'modules/Feedback/data/getServerSideProps';

export { getServerSideProps };
export default withCourse(withSession(StudentFeedbacks));
