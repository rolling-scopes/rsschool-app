import { withSession } from 'components/withSession';
import { Students } from 'modules/Mentor/pages/Students';
import { withCourse } from 'components/withCourse';
import { getServerSideProps } from 'modules/Mentor/data/getServerSideProps';

export { getServerSideProps };
export default withCourse(withSession(Students));
