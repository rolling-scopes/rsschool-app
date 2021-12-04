import { withSession } from 'components/withSession';
import { StudentFeedback } from 'modules/Feedback/pages/StudentFeedback';
import { withCourse } from 'components/withCourse';
import { getServerSideProps } from 'modules/Feedback/data/getServerSideProps';

export { getServerSideProps }
export default withCourse(withSession(StudentFeedback));
