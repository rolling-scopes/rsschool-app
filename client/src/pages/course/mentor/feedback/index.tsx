import { withSession } from 'components/withSession';
import { StudentFeedback } from 'modules/Mentor/pages/StudentFeedback';
import { withCourse } from 'components/withCourse';
import { getServerSideProps } from 'modules/Mentor/data/getServerSideProps';

export { getServerSideProps };
export default withCourse(withSession(StudentFeedback));
