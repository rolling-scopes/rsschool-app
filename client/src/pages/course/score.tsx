import { withSession } from 'components/withSession';
import { getServerSideProps } from 'modules/Score/data/getServerSideProps';
import { ScorePage } from 'modules/Score/pages/ScorePage';

export { getServerSideProps };
export default withSession(ScorePage);
