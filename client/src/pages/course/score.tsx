import { withSession } from 'components/withSession';
import { getCourseProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { ScorePage } from 'modules/Score/pages/ScorePage';

export { getServerSideProps };
export default withSession(ScorePage);
