import { withSession } from 'components';
import { getServerSideProps } from 'modules/TechnicalInterviews/data/getServerSideProps';
import { TechnicalInterviewsPage } from 'modules/TechnicalInterviews/pages/TechnicalInterviewsPage';

export { getServerSideProps };
export default withSession(TechnicalInterviewsPage);
