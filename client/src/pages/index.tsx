import { withSession } from 'components/withSession';
import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { HomePage } from 'modules/Home/pages/HomePage';

export { getServerSideProps };
export default withSession(HomePage);
